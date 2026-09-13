import { SectionHeading } from "@/components/home/SectionHeading";
import { Rating } from "@/components/product/Rating";
import { Card, CardContent } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { testimonials } from "@/data/mock-storefront";

/**
 * Testimonial cards.
 *
 * The quotes are written placeholders for the preview, kept in
 * `mock-storefront.ts` so a real review source can replace them without
 * changing this component.
 */
export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="section-y gradient-hero border-y border-border-subtle"
    >
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Early impressions"
          title="Loved for the Experience"
          description="Sample quotes used while the store is in preview."
          align="center"
          className="reveal"
        />

        <ul className="reveal-stagger grid gap-4 sm:gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id} className="flex">
              <Card variant="elevated" className="w-full">
                <CardContent className="flex h-full flex-col gap-5">
                  <Rating value={testimonial.rating} />

                  <blockquote className="flex-1 text-base leading-relaxed font-medium">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  <figcaption className="flex items-center gap-3 border-t border-border-subtle pt-4">
                    <span
                      aria-hidden="true"
                      className="gradient-brand grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                    >
                      {testimonial.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {testimonial.author}
                      </span>
                      <span className="type-caption block text-foreground-subtle">
                        {testimonial.location}
                      </span>
                    </span>
                  </figcaption>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
