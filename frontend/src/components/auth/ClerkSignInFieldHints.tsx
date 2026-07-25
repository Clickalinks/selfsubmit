"use client";

import { useEffect } from "react";

/**
 * Clerk sometimes omits autocomplete on password inputs. Chrome then logs a DOM warning
 * that can dump the <input> (including its value) into the console. Set the attributes
 * after Clerk mounts so that warning is less likely.
 */
export function ClerkSignInFieldHints() {
  useEffect(() => {
    const apply = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((el) => {
        if (!el.getAttribute("autocomplete")) {
          el.setAttribute("autocomplete", "current-password");
        }
        el.setAttribute("data-lpignore", "true");
      });
      root
        .querySelectorAll<HTMLInputElement>(
          'input[name="identifier"], input[name="emailAddress"], input[type="email"]',
        )
        .forEach((el) => {
          if (!el.getAttribute("autocomplete")) {
            el.setAttribute("autocomplete", "username");
          }
        });
    };

    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
