"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["system", "light", "dark"];
const ICON = { system: Monitor, light: Sun, dark: Moon };
const LABEL = { system: "Theme: match system", light: "Theme: light", dark: "Theme: dark" };

function apply(theme: Theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}

// Cycles system -> light -> dark. The choice is per browser (localStorage);
// THEME_INIT_SCRIPT applies it before first paint.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cs-theme") as Theme | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with storage after hydration
      if (saved && ORDER.includes(saved)) setTheme(saved);
    } catch {}
  }, []);
  const Icon = ICON[theme];
  return (
    <button
      type="button"
      title={LABEL[theme]}
      aria-label={`${LABEL[theme]}. Click to change.`}
      onClick={() => {
        const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
        setTheme(next);
        apply(next);
        try {
          localStorage.setItem("cs-theme", next);
        } catch {}
      }}
      className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-sunken hover:text-foreground"
    >
      <Icon size={18} />
    </button>
  );
}

export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("cs-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
