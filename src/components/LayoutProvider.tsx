import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { language } = useApp();

  const direction = language === "AR" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language.toLowerCase();

    // Apply font-family based on language
    if (language === "AR") {
      document.documentElement.style.setProperty("font-family", "var(--font-cairo)");
    } else {
      document.documentElement.style.setProperty("font-family", "var(--font-inter)");
    }
  }, [language, direction]);

  return (
    <div dir={direction} className="font-sans">
      {children}
    </div>
  );
}
