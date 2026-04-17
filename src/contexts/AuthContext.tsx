"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

type UserRole = "Administrator" | "Sales Manager" | "Sales Agent";
type TeamStatus = "Active" | "On Leave" | "Inactive";

interface AccessProfile {
  role: UserRole;
  status: TeamStatus;
  allowedRoutes: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessProfile: AccessProfile | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  canAccessRoute: (route: string) => boolean;
  getDefaultRoute: () => string;
}

const ROLE_ROUTES: Record<UserRole, string[]> = {
  Administrator: ["/", "/leads", "/pipeline", "/follow-ups", "/properties", "/team", "/reports", "/settings"],
  "Sales Manager": ["/", "/leads", "/pipeline", "/follow-ups", "/properties", "/reports"],
  "Sales Agent": ["/", "/leads", "/pipeline", "/follow-ups", "/properties"],
};

const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  Administrator: "/",
  "Sales Manager": "/reports",
  "Sales Agent": "/leads",
};

const PUBLIC_ROUTES = ["/login"];

/** True if pathname is allowed: "/" matches only exactly; other bases match subpaths too. */
function matchesAllowedRoute(pathname: string, allowedRoutes: string[]): boolean {
  const path = pathname || "/";
  return allowedRoutes.some((base) => {
    if (base === "/") return path === "/";
    return path === base || path.startsWith(`${base}/`);
  });
}

function normalizeTeamStatus(raw: unknown): TeamStatus | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  if (s === "active") return "Active";
  if (s === "on leave" || s === "on_leave" || s === "leave") return "On Leave";
  if (s === "inactive") return "Inactive";
  return null;
}

function normalizeTeamRole(raw: unknown): UserRole | null {
  if (typeof raw !== "string") return null;
  const r = raw.trim().toLowerCase();
  if (r === "administrator" || r === "admin" || r === "super admin" || r === "superadmin" || r === "owner")
    return "Administrator";
  if (r === "sales manager" || r === "manager") return "Sales Manager";
  if (r === "sales agent" || r === "agent") return "Sales Agent";
  return null;
}

function accessProfileFromTeamData(data: Record<string, unknown>): AccessProfile | null {
  const status = normalizeTeamStatus(data.status);
  if (status !== "Active") return null;
  const role = normalizeTeamRole(data.role);
  if (!role) return null;
  return {
    role,
    status,
    allowedRoutes: ROLE_ROUTES[role] ?? ["/"],
  };
}

async function fetchTeamAccessProfile(email: string): Promise<AccessProfile | null> {
  if (!db) return null;
  const emailKey = email.trim().toLowerCase();
  if (!emailKey) return null;

  const byId = await getDoc(doc(db, "teamMembers", emailKey));
  if (byId.exists()) {
    return accessProfileFromTeamData(byId.data() as Record<string, unknown>);
  }

  const byEmailField = query(
    collection(db, "teamMembers"),
    where("email", "==", emailKey),
    limit(1),
  );
  const listed = await getDocs(byEmailField);
  if (listed.empty) return null;
  return accessProfileFromTeamData(listed.docs[0].data() as Record<string, unknown>);
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessProfile: null,
  loginWithGoogle: async () => {},
  logout: async () => {},
  canAccessRoute: () => false,
  getDefaultRoute: () => "/",
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [accessProfile, setAccessProfile] = useState<AccessProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const canAccessRoute = useCallback(
    (route: string) => {
      if (PUBLIC_ROUTES.includes(route)) return true;
      if (!accessProfile) return false;
      return matchesAllowedRoute(route, accessProfile.allowedRoutes);
    },
    [accessProfile],
  );

  const getDefaultRoute = useCallback(() => {
    if (!accessProfile) return "/";
    return DEFAULT_ROUTE_BY_ROLE[accessProfile.role] ?? "/";
  }, [accessProfile]);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccessProfile(null);
        setLoading(false);
        return;
      }

      const profile = currentUser.email ? await fetchTeamAccessProfile(currentUser.email) : null;
      if (!profile) {
        await signOut(auth);
        setAccessProfile(null);
        setLoading(false);
        return;
      }

      setAccessProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }

    if (!accessProfile) return;

    if (pathname === "/login") {
      router.replace(DEFAULT_ROUTE_BY_ROLE[accessProfile.role] ?? "/");
      return;
    }

    if (!matchesAllowedRoute(pathname, accessProfile.allowedRoutes)) {
      router.replace(DEFAULT_ROUTE_BY_ROLE[accessProfile.role] ?? "/");
    }
  }, [loading, user, accessProfile, pathname, router]);

  const loginWithGoogle = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const signedInUser = result.user;
    const profile = signedInUser.email ? await fetchTeamAccessProfile(signedInUser.email) : null;

    if (!profile) {
      await signOut(auth);
      const hint = signedInUser.email?.toLowerCase() ?? "your-email";
      throw new Error(
        `No access for ${hint}. In Firebase → Firestore → teamMembers, use Document ID "${hint}" (lowercase) with fields role: Administrator (or Admin) and status: Active — or add the same email in field "email".`,
      );
    }

    await setDoc(
      doc(db, "users", signedInUser.uid),
      {
        uid: signedInUser.uid,
        name: signedInUser.displayName ?? "",
        email: signedInUser.email?.toLowerCase() ?? "",
        role: profile.role,
        status: profile.status,
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true },
    );

    setAccessProfile(profile);
    router.push(DEFAULT_ROUTE_BY_ROLE[profile.role] ?? "/");
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, accessProfile, loginWithGoogle, logout, canAccessRoute, getDefaultRoute }}
    >
      {children}
    </AuthContext.Provider>
  );
}
