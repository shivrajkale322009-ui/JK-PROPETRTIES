import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "JK Properties Lead Manager",
  description: "Production-ready Real Estate Lead Management System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2d1b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
