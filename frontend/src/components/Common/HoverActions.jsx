import React from "react";
import { PiPencilSimple, PiTrash, PiEye } from "react-icons/pi";

export default function HoverActions({
    onEdit,
    onDelete,
    onView,
    extra,
    editTooltip = "Edit",
    deleteTooltip = "Delete",
    viewTooltip = "View",
    className = "",
}) {
    return (
        <div className={`flex items-center justify-end gap-1.5 whitespace-nowrap ${className}`}>
            {extra}
            {onView && (
                <button
                    onClick={onView}
                    title={viewTooltip}
                    className="p-2 text-slate-500 hover:text-white bg-slate-50 hover:bg-slate-600 rounded-xl transition-all cursor-pointer"
                >
                    <PiEye className="w-4 h-4" />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    title={editTooltip}
                    className="p-2 text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-all cursor-pointer"
                >
                    <PiPencilSimple className="w-4 h-4" />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    title={deleteTooltip}
                    className="p-2 text-red-500 hover:text-white bg-red-50 hover:bg-red-600 rounded-xl transition-all cursor-pointer"
                >
                    <PiTrash className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
