import React from "react";
import FullscreenGate from "./FullscreenGate";
import FullscreenWarningOverlay from "./FullscreenWarningOverlay";

export default function TestShell({
    isStarted,
    onStart,
    onCancel,
    title,
    description,
    icon,
    isFullscreen,
    showWarning,
    onWarningResume,
    onWarningExit,
    warningType = "fullscreen",
    tabSwitches = 0,
    maxSwitches = 3,
    className = "",
    children,
}) {
    if (!isStarted) {
        return (
            <FullscreenGate
                isStarted={isStarted}
                onStart={onStart}
                onCancel={onCancel}
                title={title}
                description={description}
                icon={icon}
            />
        );
    }

    return (
        <div
            className={className || `min-h-screen bg-[#FAF9F6] text-slate-800 pb-20 relative select-none ${
                isFullscreen ? "h-screen overflow-y-auto" : ""
            }`}
            onContextMenu={(e) => e.preventDefault()}
        >
            <FullscreenWarningOverlay
                isOpen={showWarning}
                onResume={onWarningResume}
                onExit={onWarningExit}
                warningType={warningType}
                tabSwitches={tabSwitches}
                maxSwitches={maxSwitches}
            />
            {children}
        </div>
    );
}
