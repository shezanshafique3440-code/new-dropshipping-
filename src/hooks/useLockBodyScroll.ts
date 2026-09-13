"use client";

import { useEffect } from "react";

/**
 * Prevents the page behind an overlay from scrolling while `locked` is true.
 * Restores the previous `overflow` value on unlock and unmount.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
