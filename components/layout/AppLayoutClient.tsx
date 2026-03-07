"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

const SIDEBAR_PATHS = [
  "/dashboard",
  "/developers",
  "/jobs",
  "/messages",
  "/workspace",
  "/profile",
  "/tests",
  "/admin",
];

function useShowSidebar() {
  const pathname = usePathname();
  return SIDEBAR_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const showSidebar = useShowSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar: hidden on mobile */}
      <aside className="hidden md:block md:w-56 md:shrink-0">
        <AppSidebar />
      </aside>
      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-modal="true"
        aria-label="Main navigation"
      >
        <AppSidebar onNavigate={closeMobileMenu} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setMobileMenuOpen((v) => !v)} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
