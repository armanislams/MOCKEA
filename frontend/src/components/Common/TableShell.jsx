import { PiSpinner, PiWarning, PiDatabase } from "react-icons/pi";

export default function TableShell({
    isLoading,
    isError,
    errorText = "Failed to load data.",
    empty,
    emptyTitle = "No Data Found",
    emptyText = "There are no records to display at this time.",
    emptyIcon,
    loadingText = "Loading content...",
    onRetry,
    transparent = false,
    children,
}) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm">
                <PiSpinner className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest animate-pulse">
                    {loadingText}
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm text-center px-6">
                <PiWarning className="w-12 h-12 text-red-500" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">{errorText}</h3>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="btn btn-sm btn-outline rounded-xl font-bold"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    if (empty) {
        return (
            <div className="card bg-white dark:bg-gray-800 p-16 text-center border border-slate-100 dark:border-gray-700 rounded-[2rem] shadow-sm space-y-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-gray-700 text-slate-300 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                    {emptyIcon || <PiDatabase />}
                </div>
                <h3 className="text-xl font-black text-slate-700 dark:text-white">{emptyTitle}</h3>
                {emptyText && (
                    <p className="text-slate-400 dark:text-gray-400 text-sm max-w-sm mx-auto font-medium">
                        {emptyText}
                    </p>
                )}
            </div>
        );
    }

    if (transparent) {
        return children;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
            {children}
        </div>
    );
}
