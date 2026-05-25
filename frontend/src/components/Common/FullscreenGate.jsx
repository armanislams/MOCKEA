import React from "react";
import { PiMonitor } from "react-icons/pi";

export const FullscreenGate = ({ 
  isStarted, 
  onStart, 
  onCancel, 
  title = "Ready to Start?", 
  description = "This practice test will open in fullscreen mode. Ensure you are in a quiet environment.",
  icon: Icon
}) => {
  if (isStarted) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="card bg-white w-full max-w-md p-10 text-center space-y-6 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl">
          {Icon ? <Icon /> : <PiMonitor />}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800">{title}</h1>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>
        <button 
          onClick={onStart}
          className="btn btn-primary btn-lg rounded-2xl h-16 w-full text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Enter Practice Environment
        </button>
        <button onClick={onCancel} className="btn btn-ghost text-slate-500 hover:bg-slate-50">Cancel</button>
      </div>
    </div>
  );
};

export default FullscreenGate;
