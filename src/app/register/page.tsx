import type { Metadata } from "next";

import { AuthPanel, AuthPanelLink } from "@/components/account/AuthPanel";
import { RegisterForm } from "@/components/account/RegisterForm";
import { safeNextPath } from "@/lib/redirects";
import { loginHref } from "@/lib/routes";
import { requireGuest } from "@/server/auth/current-customer";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a ZYVERO account.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : undefined;
  const next = safeNextPath(raw);

  await requireGuest(next);

  return (
    <AuthPanel
      eyebrow="Join ZYVERO"
      title="Create your account"
      description="Checkout stays available to guests — an account simply saves you repeating yourself."
      footer={
        <>
          Already have an account?{" "}
          <AuthPanelLink href={loginHref(raw)}>Sign in</AuthPanelLink>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthPanel>
  );
}
