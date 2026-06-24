import { PiWarningCircle, PiX } from "react-icons/pi";

export function MobileWarningModal({ isOpen, onExit, onProceed }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onExit} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-orange-500 p-6 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <PiWarningCircle className="w-8 h-8" />
            Mobile Device Detected
          </h2>
          <button onClick={onExit} className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20">
            <PiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 text-center">
          <p className="text-slate-600 leading-relaxed">
            This test is not designed for mobile devices. For the best experience and full functionality, please use a desktop or laptop computer.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onExit}
              className="btn btn-error btn-lg rounded-2xl h-14 w-full font-bold text-white"
            >
              Exit
            </button>
            <button
              onClick={onProceed}
              className="btn btn-outline btn-lg rounded-2xl h-14 w-full font-bold"
            >
              Continue at My Own Risk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileWarningModal;
