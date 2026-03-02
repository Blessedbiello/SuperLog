"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  Calendar,
  Target,
  BarChart3,
  User,
  Settings,
  Shield,
  Users,
  CheckCircle,
  Gift,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// ─── Navigation definitions ───────────────────────────────────────────────────

const memberNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Activities", href: "/activities", icon: Activity },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Shield },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Verification", href: "/admin/verification", icon: CheckCircle },
  { label: "Rewards", href: "/admin/rewards", icon: Gift },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({
  item,
  isCollapsed,
  isActive,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      className={clsx(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-emerald-500/15 text-emerald-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-500" />
      )}
      <Icon
        className={clsx(
          "shrink-0 transition-colors duration-150",
          isCollapsed ? "h-5 w-5" : "h-4 w-4",
          isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
        )}
      />
      {!isCollapsed && (
        <span className="truncate leading-none">{item.label}</span>
      )}
    </Link>
  );
}

function NavSection({
  title,
  items,
  pathname,
  isCollapsed,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {!isCollapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isCollapsed={isCollapsed}
          isActive={
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          }
        />
      ))}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image ?? null;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={clsx(
        "relative flex h-full flex-col bg-slate-900 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-md transition-colors hover:bg-slate-700 hover:text-slate-100"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Logo / Branding */}
      <div
        className={clsx(
          "flex h-16 shrink-0 items-center border-b border-slate-800",
          isCollapsed ? "justify-center px-0" : "gap-2.5 px-5"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-base font-bold tracking-tight text-white">
            SuperLog
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <NavSection
          title="Menu"
          items={memberNavItems}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        {isAdmin && (
          <div className="mt-6">
            {!isCollapsed && (
              <div className="mb-2 flex items-center gap-2 px-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Admin
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
            )}
            {isCollapsed && <div className="mb-2 mx-3 h-px bg-slate-800" />}
            <NavSection
              title="Admin"
              items={adminNavItems}
              pathname={pathname}
              isCollapsed={isCollapsed}
            />
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        <div
          className={clsx(
            "flex items-center gap-3 rounded-lg px-2 py-2",
            isCollapsed && "justify-center"
          )}
        >
          {/* Avatar */}
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-700">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-xs font-semibold text-white">
                {userInitial}
              </div>
            )}
          </div>

          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">
                  {userName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {session?.user?.email ?? ""}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign out"
                aria-label="Sign out"
                className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            aria-label="Sign out"
            className="mt-1 flex w-full items-center justify-center rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
