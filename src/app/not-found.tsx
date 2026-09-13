import type { Metadata } from "next";

import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
