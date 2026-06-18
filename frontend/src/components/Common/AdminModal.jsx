import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function AdminModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = "max-w-2xl",
    slideOver = false,
}) {
    if (!isOpen) return null;

    if (slideOver) {
        return (
            <div className="fixed inset-0 z-[1050] flex items-center justify-end p-0 bg-black/60 backdrop-blur-xs">
                <div className="absolute inset-0" onClick={onClose} />
                <motion.div 
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.35 }}
                    className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-gray-800 shadow-2xl flex flex-col justify-between p-10 overflow-y-auto"
                >
                    <div className="flex-1 flex flex-col justify-between h-full">
                        <div className="space-y-8">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-700 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">{title}</h2>
                                    {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-gray-700 p-2 rounded-full transition-colors cursor-pointer">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="py-2">
                                {children}
                            </div>
                        </div>
                        {footer && (
                            <div className="pt-6 border-t border-slate-100 dark:border-gray-700 flex gap-4 mt-6">
                                {footer}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="absolute inset-0" onClick={onClose} />
            <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full ${maxWidth} my-8 relative flex flex-col max-h-[90vh]`}>
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-3xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
                        {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-gray-700 p-2 rounded-full transition-colors cursor-pointer">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                
                {footer && (
                    <div className="p-6 border-t border-slate-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-3xl z-10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
