import { useEffect, useState } from "react";

export default function useLayoutState({ currentPageName, navigationItems, location }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    if (currentPageName === "ViewAssignment") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const activeSubItemParent = navigationItems.find((item) =>
      item.subItems?.some((sub) => {
        const subItemPath = sub.href.split("?")[0];
        const subItemSearch = sub.href.split("?")[1] || "";
        const currentLocationPath = location.pathname;
        const currentLocationSearch = location.search;

        return currentLocationPath === subItemPath && (subItemSearch ? currentLocationSearch.includes(subItemSearch) : true);
      })
    );

    if (activeSubItemParent) {
      setExpandedMenu(activeSubItemParent.name);
    }

    const activeTopLevelItem = navigationItems.find(
      (item) => !item.subItems && (location.pathname === item.href || item.href === "/")
    );

    if (activeTopLevelItem && !activeSubItemParent) {
      setExpandedMenu(null);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [location, currentPageName, navigationItems]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((value) => !value);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSubmenu = (itemName) => {
    setExpandedMenu((value) => (value === itemName ? null : itemName));
  };

  return {
    isMobileMenuOpen,
    isMobile,
    expandedMenu,
    toggleMobileMenu,
    closeMobileMenu,
    toggleSubmenu,
  };
}