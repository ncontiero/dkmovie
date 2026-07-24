"use client";

import { useCallback, useEffect, useState } from "react";

interface UseIsMobileReturn {
  isMobile: boolean;
  isLoading: boolean;
}

export function useIsMobile(
  { mobileMaxWidth }: { mobileMaxWidth: number } = { mobileMaxWidth: 768 },
): UseIsMobileReturn {
  const checkIsMobileDevice = useCallback(() => {
    if (typeof window === "undefined") return false;
    const mediaQuery = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`);
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
    return mediaQuery.matches || (isMobileUA && window.innerWidth <= 768);
  }, [mobileMaxWidth]);

  const [isMobile, setIsMobile] = useState(checkIsMobileDevice);
  const [isLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(checkIsMobileDevice());

    const mediaQuery = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`);
    mediaQuery.addEventListener("change", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMaxWidth, checkIsMobileDevice]);

  return {
    isMobile,
    isLoading,
  };
}
