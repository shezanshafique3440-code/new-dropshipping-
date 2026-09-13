import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/types";

/**
 * Trust notes.
 *
 * Only claims the storefront can actually stand behind at this stage — no
 * compliance badges, no certificate claims, no invented guarantees.
 */
const notes: ReadonlyArray<{ icon: IconName; label: string }> = [
  { icon: "lock", label: "Card details are entered on Stripe, never on ZYVERO" },
  { icon: "shield", label: "Your details stay in this browser session" },
  { icon: "chat", label: "Questions? Support is one message away" },
];

export function CheckoutTrust() {
  return (
    <ul className="flex flex-col gap-2.5">
      {notes.map((note) => (
        <li
          key={note.label}
          className="type-caption flex items-start gap-2.5 text-foreground-muted"
        >
          <Icon
            name={note.icon}
            className="mt-px size-4 shrink-0 text-foreground-subtle"
          />
          {note.label}
        </li>
      ))}
    </ul>
  );
}
