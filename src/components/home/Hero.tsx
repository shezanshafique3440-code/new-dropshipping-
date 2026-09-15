import { ProductImage } from "@/components/product/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";
import { IMAGE_SIZES } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** Compact product tile used only inside the hero composition. */
function HeroTile({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  /** Preloads the image. Only the first tile in the composition sets it. */
  priority?: boolean;
}) {
  return (
    <Card
      variant="elevated"
      interactive
      className={cn("overflow-hidden", className)}
    >
      {/* The tile prints the product's name underneath, so the image is
          decorative here rather than described twice. The first hero tile is
          the page's largest above-the-fold image, so it is preloaded. */}
      <ProductImage
        product={product}
        ratio="square"
        sizes={IMAGE_SIZES.hero}
        alt=""
        priority={priority}
      />
      <div className="flex items-center justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="type-caption text-foreground-subtle">
            {product.category}
          </p>
          <p className="truncate text-sm font-semibold">{product.name}</p>
        </div>
        <p className="shrink-0 text-sm font-bold">
          {formatPrice(product.price)}
        </p>
      </div>
    </Card>
  );
}

/**
 * Homepage hero: campaign copy on the left, a staggered composition of demo
 * product tiles on the right. The composition is a two-column grid rather than
 * absolutely-placed cards, so it keeps its shape from 320px up.
 */
export interface HeroProps {
  /**
   * Three published products for the composition. Fewer is fine — each tile
   * simply does not render — so the hero survives a small catalogue.
   */
  products: readonly Product[];
}

export function Hero({ products }: HeroProps) {
  const [primary, secondary, tertiary] = products;

  return (
    <section className="gradient-hero relative overflow-hidden">
      {/* Ambient depth. Decorative only. */}
      <span
        aria-hidden="true"
        className="animate-float-soft gradient-brand pointer-events-none absolute -top-24 -left-16 size-72 rounded-full opacity-25 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="animate-float-soft gradient-accent pointer-events-none absolute top-1/3 -right-20 size-80 rounded-full opacity-20 blur-3xl [animation-delay:3s]"
      />

      <Container className="relative grid items-center gap-14 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 lg:py-20">
        <div className="flex flex-col items-start gap-6">
          <span className="type-eyebrow animate-fade-down text-brand-primary">
            The new way to shop
          </span>

          <h1 className="type-display animate-fade-up max-w-2xl">
            Discover{" "}
            <span className="text-gradient-brand">What&rsquo;s Next.</span>
          </h1>

          <p className="type-body-lg animate-fade-up max-w-xl text-foreground-muted [animation-delay:80ms]">
            Curated products, bold finds, and everyday favorites — all in one
            place.
          </p>

          <div className="flex w-full animate-fade-up flex-col gap-3 [animation-delay:140ms] sm:w-auto sm:flex-row">
            <ButtonLink href="/shop" size="lg" variant="gradient">
              Shop Now
              <Icon name="arrowRight" className="size-4" strokeWidth={2} />
            </ButtonLink>
            <ButtonLink href="/shop" size="lg" variant="outline">
              Explore Trending
            </ButtonLink>
          </div>

          <p className="type-caption animate-fade-up flex items-center gap-2 text-foreground-subtle [animation-delay:200ms]">
            <Icon name="truck" className="size-4" />
            Free worldwide delivery over{" "}
            {formatPrice(75, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-scale-in [animation-delay:220ms] lg:max-w-none">
          <div className="grid grid-cols-2 items-start gap-3 sm:gap-4">
            {/* Left column sits lower, giving the composition depth. */}
            <div className="animate-float-soft flex flex-col gap-3 pt-8 sm:gap-4 sm:pt-12">
              {secondary ? (
                <div className="relative">
                  <HeroTile product={secondary} />
                  <Badge
                    variant="gradient"
                    className="absolute top-2.5 left-2.5 shadow-floating"
                  >
                    Trending
                  </Badge>
                </div>
              ) : null}
              {tertiary ? (
                <div className="relative hidden sm:block">
                  <HeroTile product={tertiary} />
                  <Badge
                    variant="floating"
                    className="absolute top-2.5 left-2.5"
                  >
                    Best Seller
                  </Badge>
                </div>
              ) : null}
            </div>
            <div className="animate-float-soft flex flex-col gap-3 sm:gap-4 [animation-delay:2s]">
              {primary ? (
                <div className="relative">
                  {/* The largest tile in the composition and the one the
                      eye lands on: worth preloading, and the only one that is. */}
                  <HeroTile product={primary} priority />
                  <Badge
                    variant="floating"
                    className="absolute top-2.5 right-2.5"
                  >
                    New Drop
                  </Badge>
                </div>
              ) : null}
              <Card
                variant="glass"
                className="flex items-center gap-3 p-4 sm:hidden"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <Icon name="sparkle" className="size-4" />
                </span>
                <p className="type-caption font-medium">
                  New drops added weekly
                </p>
              </Card>
              <Card
                variant="glass"
                className="hidden flex-col gap-2 p-5 sm:flex"
              >
                <span className="type-eyebrow text-brand-primary">
                  This week
                </span>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Fresh arrivals across tech, home and everyday essentials.
                </p>
                <p className="text-2xl font-bold tracking-tight">120+ finds</p>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
