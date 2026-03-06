import type { Metadata } from "next";
import "./globals.css";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";

export const metadata: Metadata = {
  title: "Codeveria — Hire Verified Student Developers",
  description:
    "Connect with verified student developers. Message, create workspaces, and track milestones. Skill-verified talent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppLayoutClient>{children}</AppLayoutClient>
      </body>
    </html>
  );
}
