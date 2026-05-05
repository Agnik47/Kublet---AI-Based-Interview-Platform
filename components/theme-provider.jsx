"use client"

import * as React from "react"

const ThemeContext = React.createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

const STORAGE_KEY = "theme";
const SYSTEM_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = true,
  disableTransitionOnChange = false,
}) {
  const [theme, setTheme] = React.useState(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState("light");
  const [mounted, setMounted] = React.useState(false);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const initialTheme = ["light", "dark", "system"].includes(storedTheme)
      ? storedTheme
      : defaultTheme;

    setTheme(initialTheme);

    if (enableSystem) {
      const media = window.matchMedia(SYSTEM_MEDIA_QUERY);
      const updateSystemTheme = (event) => {
        setSystemTheme(event.matches ? "dark" : "light");
      };

      setSystemTheme(media.matches ? "dark" : "light");
      media.addEventListener("change", updateSystemTheme);
      return () => media.removeEventListener("change", updateSystemTheme);
    }
  }, [defaultTheme, enableSystem]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    window.localStorage.setItem(STORAGE_KEY, theme);

    if (disableTransitionOnChange) {
      const style = document.createElement("style");
      style.textContent = `*,*::before,*::after { transition: none !important; }`;
      document.head.appendChild(style);
      window.getComputedStyle(document.body);
      window.setTimeout(() => {
        document.head.removeChild(style);
      }, 50);
    }

    if (attribute === "class") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    } else {
      document.documentElement.setAttribute(attribute, resolvedTheme);
    }

    if (enableColorScheme) {
      document.documentElement.style.colorScheme = resolvedTheme;
    }
  }, [attribute, disableTransitionOnChange, enableColorScheme, mounted, resolvedTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}