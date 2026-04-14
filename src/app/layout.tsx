import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "JK Properties Lead Manager",
  description: "Production-ready Real Estate Lead Management System",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="layout-wrapper">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}
