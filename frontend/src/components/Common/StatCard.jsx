import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ 
    icon, 
    value, 
    label, 
    color = "primary", 
    description,
    variants,
}) {
    // Determine color classes for icon container
    let colorClasses = "bg-primary/10 text-primary";
    if (color === "blue") colorClasses = "bg-blue-500/10 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400";
    else if (color === "purple") colorClasses = "bg-purple-500/10 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400";
    else if (color === "orange") colorClasses = "bg-orange-500/10 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400";
    else if (color === "green") colorClasses = "bg-green-500/10 text-green-500 dark:bg-green-900/20 dark:text-green-400";
    else if (color === "error" || color === "red") colorClasses = "bg-error/10 text-error";
    else if (color === "warning" || color === "yellow") colorClasses = "bg-warning/10 text-warning";
    else if (color.includes("bg-") || color.includes("text-")) colorClasses = color;

    const CardComponent = variants ? motion.div : "div";

    return (
        <CardComponent 
            variants={variants}
            className="stat bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 flex flex-col justify-between"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                        {label}
                    </div>
                    <div className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-800 dark:text-white mt-1">
                        {value}
                    </div>
                </div>
                {icon && (
                    <div className={`p-4 rounded-2xl text-2xl shadow-inner shrink-0 ${colorClasses}`}>
                        {icon}
                    </div>
                )}
            </div>
            {description && (
                <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest">
                    {description}
                </div>
            )}
        </CardComponent>
    );
}
