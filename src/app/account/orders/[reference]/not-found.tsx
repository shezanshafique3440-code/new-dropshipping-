import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { accountOrdersHref, shopHref } from "@/lib/routes";

/**
 * Order not found.
 *
 * Deliberately the same page whether the reference never existed, belongs to
 * another customer, or belongs to no account at all. The wording gives away
 * nothing about which.
 */
export default function OrderNotFound() {
  return (
    <Container size="md" className="section-y-sm">
      <div className="mx-auto flex max-w-lg flex-col items-start gap-4 rounded-3xl border border-border bg-surface p-8">
        <span className="grid size-11 place-items-center rounded-2xl bg-surface-muted text-foreground-subtle">
          <Icon name="search" className="size-5" />
        </span>
        <h1 className="type-h2">Order not found</h1>
        <p className="text-sm text-foreground-muted">
          We could not find that order on your account. Check the reference from
          your confirmation, or browse your order history.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={accountOrdersHref()} variant="primary">
            Back to my orders
          </ButtonLink>
          <ButtonLink href={shopHref()} variant="outline">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
