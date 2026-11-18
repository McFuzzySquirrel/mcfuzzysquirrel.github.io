"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > 400);
    }

    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <a
      href="#top"
      className={`back-to-top${visible ? " visible" : ""}`}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </a>
  );
}
