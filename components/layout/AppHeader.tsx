"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { Menu } from "lucide-react";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {onMenuClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <span className="truncate text-sm text-muted-foreground">Codeveria</span>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <NotificationBell />
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
          <Link href="/profile">Profile</Link>
        </Button>
        <SignOutButton variant="outline" size="sm" />
      </div>
    </header>
  );
}
