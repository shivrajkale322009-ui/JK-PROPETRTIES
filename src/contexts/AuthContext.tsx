"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

const normalizeRoute = (route: string) => {
  if (!route) return "/";
  if (route.startsWith("/leads/")) return "/leads";
  return route;
};

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

  const canAccessRoute = (route: string) => {
    if (PUBLIC_ROUTES.includes(route)) return true;
    if (!accessProfile) return false;
    const normalizedRoute = normalizeRoute(route);
    return accessProfile.allowedRoutes.includes(normalizedRoute);
  };

  const getDefaultRoute = () => {
    if (!accessProfile) return "/";
    return DEFAULT_ROUTE_BY_ROLE[accessProfile.role] ?? "/";
  };

  const loadAccessProfile = async (email?: string | null) => {
    if (!db || !email) return null;
    const emailKey = email.trim().toLowerCase();
    const teamRef = doc(db, "teamMembers", emailKey);
    const snap = await getDoc(teamRef);
    if (!snap.exists()) return null;
    const data = snap.data() as { role?: UserRole; status?: TeamStatus };
    if (!data.role || !data.status || data.status !== "Active") return null;
    return {
      role: data.role,
      status: data.status,
      allowedRoutes: ROLE_ROUTES[data.role] ?? ["/"],
    } satisfies AccessProfile;
  };

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccessProfile(null);
        setLoading(false);
        if (pathname !== "/login") router.push("/login");
        return;
      }

      const profile = await loadAccessProfile(currentUser.email);
      if (!profile) {
        await signOut(auth);
        setAccessProfile(null);
        setLoading(false);
        router.push("/login");
        return;
      }

      setAccessProfile(profile);
      setLoading(false);

      if (pathname === "/login") {
        router.push(DEFAULT_ROUTE_BY_ROLE[profile.role] ?? "/");
        return;
      }

      const normalizedPath = normalizeRoute(pathname);
      if (!profile.allowedRoutes.includes(normalizedPath)) {
        router.push(DEFAULT_ROUTE_BY_ROLE[profile.role] ?? "/");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const loginWithGoogle = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const signedInUser = result.user;
    const profile = await loadAccessProfile(signedInUser.email);

    if (!profile) {
      await signOut(auth);
      throw new Error("Access denied. Ask admin to add your email in Team and mark status Active.");
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
