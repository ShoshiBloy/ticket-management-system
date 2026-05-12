import React from "react";
import { formatTicketLabel } from "../ticketHelpers";

export default function Badge({ value, type }) {
    const classes = {
        status: {
            open: "bg-blue-50 text-blue-700 ring-blue-200",
            in_progress: "bg-amber-50 text-amber-700 ring-amber-200",
            closed: "bg-green-50 text-green-700 ring-green-200",
        },
        priority: {
            low: "bg-slate-50 text-slate-700 ring-slate-200",
            medium: "bg-purple-50 text-purple-700 ring-purple-200",
            high: "bg-red-50 text-red-700 ring-red-200",
        },
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                classes[type][value] ||
                "bg-slate-50 text-slate-700 ring-slate-200"
            }`}
        >
            {formatTicketLabel(value)}
        </span>
    );
}