import { useState, useEffect } from "react";
import useFullscreen from "./useFullscreen";

export const useTestIntegrity = (isStarted, submitted) => {
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isStarted) return;
    const handleFSChange = () => {
      const isFS = !!document.fullscreenElement;
      if (!isFS && isStarted && !submitted) {
        setShowWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, [isStarted, submitted]);

  useEffect(() => {
    setShowWarning(false);
    if (isStarted) {
      // Force all potential scrollable containers to the top to prevent layout shift cutoffs
      window.scrollTo({ top: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      const scrollContainers = document.querySelectorAll(".overflow-y-auto");
      scrollContainers.forEach(container => {
        container.scrollTop = 0;
      });
    }
  }, [isStarted]);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return {
    isFullscreen,
    showWarning,
    setShowWarning,
    enterFullscreen,
    exitFullscreen
  };
};

export default useTestIntegrity;
