import React from "react";

export default function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="text-sm font-semibold text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
                {value}
            </div>
        </div>
    );
}