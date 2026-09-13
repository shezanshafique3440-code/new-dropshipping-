import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

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
        <Card variant="muted" className="shadow-none">
          <CardContent className="flex flex-col gap-4">
            <CardTitle>{title}</CardTitle>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-foreground-muted"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
