import React from "react";
import { PiMonitor } from "react-icons/pi";

export const FullscreenWarningOverlay = ({ 
  isOpen, 
  onResume, 
  onExit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="card bg-white w-full max-w-md p-10 text-center space-y-6 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="mx-auto w-24 h-24 rounded-full bg-error/10 flex items-center justify-center animate-pulse">
          <PiMonitor className="w-12 h-12 text-error" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">
            Security Alert
          </h2>
          <p className="text-slate-500 leading-relaxed text-sm">
            Fullscreen mode is required to maintain the realistic test environment. Please re-enter to continue your practice.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-6">
          <button 
            onClick={onResume}
            className="btn btn-primary btn-lg rounded-2xl h-16 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Resume Practice
          </button>
          <button 
            onClick={onExit}
            className="btn btn-ghost text-error font-bold hover:bg-red-50 hover:text-red-600 rounded-2xl py-3"
          >
            Exit Practice (Auto-Submits)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenWarningOverlay;
