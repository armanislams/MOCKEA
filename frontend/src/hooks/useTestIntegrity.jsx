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
