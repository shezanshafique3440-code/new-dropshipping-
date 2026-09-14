import type { Metadata } from "next";

import { AuthPanel, AuthPanelLink } from "@/components/account/AuthPanel";
import { LoginForm } from "@/components/account/LoginForm";
import { safeNextPath } from "@/lib/redirects";
import { registerHref } from "@/lib/routes";
import { requireGuest } from "@/server/auth/current-customer";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ZYVERO account.",
  robots: { index: false, follow: true },
};

/** Rendered per request: what it shows depends on the session cookie. */
export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : undefined;
  // Sanitised here and again when it is acted on: a crafted `next` never
  // becomes a redirect off this site.
  const next = safeNextPath(raw);

  await requireGuest(next);

  return (
    <AuthPanel
      eyebrow="Welcome back"
      title="Sign in to ZYVERO"
      description="Your account keeps your details ready for next time."
      footer={
        <>
          New to ZYVERO?{" "}
          <AuthPanelLink href={registerHref(raw)}>Create an account</AuthPanelLink>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthPanel>
  );
}
