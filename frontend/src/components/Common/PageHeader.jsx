import React from "react";

export default function PageHeader({
    preTitle,
    title,
    subtitle,
    icon,
    action,
    className = "",
}) {
    return (
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 gap-4 ${className}`}>
            <div className="space-y-1">
                {preTitle && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {preTitle}
                    </p>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {icon && <span className="text-primary shrink-0">{icon}</span>}
                    <span>{title}</span>
                </h1>
                {subtitle && (
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium italic">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className="shrink-0 self-start sm:self-center">
                    {action}
                </div>
            )}
        </div>
    );
}
