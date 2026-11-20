"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("career-console-theme");
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }

    fetch("/api/user/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.theme === "light" || data?.theme === "dark") {
          setThemeState(data.theme);
          window.localStorage.setItem("career-console-theme", data.theme);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  function setTheme(next) {
    if (next !== "light" && next !== "dark") return;
    setThemeState(next);
    window.localStorage.setItem("career-console-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
