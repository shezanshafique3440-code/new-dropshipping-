import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export interface PlaceholderPanelProps {
  title: string;
  /** Capabilities scheduled for a later build step. */
  items: readonly string[];
}

/**
 * Scaffolding panel that documents what a route will contain once its feature
 * step lands. Temporary: each page replaces it with its real UI.
 */
export function PlaceholderPanel({ title, items }: PlaceholderPanelProps) {
  return (
    <section className="section-y">
      <Container size="md">
        <Card variant="elevated">
          <CardContent className="flex flex-col gap-5">
            <CardTitle>{title}</CardTitle>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-brand-primary"
                  >
                    <Icon name="arrowRight" className="size-3" strokeWidth={2} />
                  </span>
                  <span className="text-foreground-muted">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
