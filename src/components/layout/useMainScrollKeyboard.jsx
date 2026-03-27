import { useEffect } from "react";

export default function useMainScrollKeyboard(mainRef) {
  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;

    const handleKeyDown = (e) => {
      if (e.key === "PageDown") {
        e.preventDefault();
        element.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      } else if (e.key === "PageUp") {
        e.preventDefault();
        element.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      } else if (e.key === "Home") {
        e.preventDefault();
        element.scrollTo({ top: 0, behavior: "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mainRef]);
}