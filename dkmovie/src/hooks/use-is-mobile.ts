"use client";

import { useEffect, useState } from "react";

interface UseIsMobileReturn {
  isMobile: boolean;
  isLoading: boolean;
}

export function useIsMobile(): UseIsMobileReturn {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check using media query
      const mediaQuery = window.matchMedia("(max-width: 768px)");

      // Check using user agent (additional detection)
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "android",
        "webos",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
        "mobile",
      ];

      const isMobileUA = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword),
      );

      // Combine both checks - prioritize media query but consider user agent
      const isMobileDevice =
        mediaQuery.matches || (isMobileUA && window.innerWidth <= 768);

      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    // Initial check
    checkIsMobile();

    // Listen for media query changes
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    mediaQuery.addEventListener("change", checkIsMobile);
    window.addEventListener("resize", checkIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", checkIsMobile);
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return {
    isMobile,
    isLoading,
  };
}
