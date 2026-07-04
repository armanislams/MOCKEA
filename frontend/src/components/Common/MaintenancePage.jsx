import { PiGear } from "react-icons/pi";
import { useOutletContext } from "react-router";

const MaintenancePage = ({ message }) => {
  const context = useOutletContext();
  const displayMessage = message || context?.maintenanceMessage;
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full space-y-8 p-10 bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center">
          {/* Rotating gear icon */}
          <div className="bg-slate-700/50 p-6 rounded-full border border-slate-600/50 mb-6 relative">
            <PiGear className="w-16 h-16 text-primary animate-spin [animation-duration:10s]" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">System Maintenance</h1>
          <div className="w-12 h-1 bg-primary rounded-full my-4"></div>
          
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            {displayMessage || "We are currently conducting scheduled upgrades to improve your mock exam experience. We will be back online shortly."}
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold pt-4 border-t border-slate-700/50">
          Thank you for your patience. — MOCKEA Team
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
