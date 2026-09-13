import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { withPrice } from "@/lib/format";

/** Slim promotional strip above the header. */
export function AnnouncementBar() {
  const { message, amount, cta } = siteConfig.announcement;

  return (
    <div className="gradient-brand text-white">
      <Container className="flex min-h-9 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1.5 text-center">
        <p className="text-[0.8125rem] leading-snug font-medium">
          {withPrice(message, amount)}
        </p>
        {cta ? (
          <Link
            href={cta.href}
            className="link-underline hidden items-center gap-1 text-[0.8125rem] font-semibold text-white/90 transition-colors hover:text-white sm:inline-flex"
          >
            {cta.label}
            <Icon name="arrowRight" className="size-3.5" strokeWidth={2} />
          </Link>
        ) : null}
      </Container>
    </div>
  );
}
