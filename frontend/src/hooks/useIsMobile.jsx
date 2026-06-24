import { useMemo } from "react";

const MOBILE_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Kindle|Silk|Mobile|Tablet/i;

export function useIsMobile() {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      MOBILE_REGEX.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches)
    );
  }, []);

  return isMobile;
}

export default useIsMobile;
