"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/activities": "Activities",
  "/calendar": "Calendar",
  "/goals": "Goals",
  "/reports": "Reports",
  "/profile": "Profile",
  "/settings": "Settings",
  "/admin": "Admin Overview",
  "/admin/members": "Members",
  "/admin/verification": "Verification",
  "/admin/rewards": "Rewards",
  "/admin/analytics": "Analytics",
  "/admin/events": "Events",
  "/admin/settings": "Admin Settings",
};

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Match by prefix for nested routes (longest match wins)
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key) && key !== "/")
    .sort((a, b) => b.length - a.length)[0];

  return match ? PAGE_TITLES[match] : "SuperLog";
}

// ─── Notification bell ────────────────────────────────────────────────────────

interface NotificationBellProps {
  unreadCount?: number;
}

function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  return (
    <button
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-700"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image ?? null;
  const userInitial = userName.charAt(0).toUpperCase();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-gray-100"
      >
        {/* Avatar */}
        <div className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-gray-200">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              fill
              className="object-cover"
              sizes="28px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-emerald-500 text-xs font-semibold text-white">
              {userInitial}
            </div>
          )}
        </div>
        <span className="hidden max-w-[120px] truncate font-medium sm:block">
          {userName}
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-slate-400 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-slate-800">
              {userName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {session?.user?.email ?? ""}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-gray-50 hover:text-slate-900"
            >
              <User className="h-4 w-4 text-slate-400" />
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-gray-50 hover:text-slate-900"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

interface TopbarProps {
  onMobileMenuToggle: () => void;
  unreadNotifications?: number;
}

export function Topbar({
  onMobileMenuToggle,
  unreadNotifications = 0,
}: TopbarProps) {
  const pathname = usePathname();
  const pageTitle = resolvePageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        aria-label="Toggle navigation menu"
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-lg font-semibold text-slate-800 lg:text-xl">
        {pageTitle}
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="h-9 w-48 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 transition-all duration-150 focus:w-64 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 lg:w-56"
          />
        </div>

        {/* Mobile search icon */}
        <button
          aria-label="Search"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-700 sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <NotificationBell unreadCount={unreadNotifications} />

        {/* User dropdown */}
        <UserDropdown />
      </div>
    </header>
  );
}
