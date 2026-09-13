"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Navigation link that marks the current route for both sighted users and
 * assistive technology.
 */
export function NavLink({
  href,
  children,
  className,
  activeClassName = "text-foreground",
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "rounded-full transition-colors duration-200 hover:text-foreground",
        active ? activeClassName : "text-foreground-muted",
        className,
      )}
    >
      {children}
    </Link>
  );
}
