"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface AdminSignOutButtonProps {
  className?: string;
}

/**
 * Sign out of the panel.
 *
 * The button only asks the server; the session is revoked there and the
 * cookie is cleared there. Nothing about being signed in is kept in React, so
 * there is no client state to reset — the navigation afterwards re-renders
 * every server component as a signed-out visitor, which is why it is a
 * `replace` plus a `refresh` rather than a soft push.
 */
export function AdminSignOutButton({ className }: AdminSignOutButtonProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [failed, setFailed] = useState(false);

  const signOut = async () => {
    if (signingOut) {
      return;
    }
    setSigningOut(true);
    setFailed(false);

    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) {
        setSigningOut(false);
        setFailed(true);
        return;
      }
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      setFailed(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        aria-busy={signingOut}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground-muted",
          "transition-colors duration-200 hover:bg-surface-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <Icon name="close" className="size-4.5 shrink-0" strokeWidth={2} />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
      {failed ? (
        <p role="alert" className="type-caption px-3 font-medium text-danger">
          Sign-out did not complete. Try again.
        </p>
      ) : null}
    </div>
  );
}
