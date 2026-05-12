import React from "react";

export default function TicketCreateModal({
    form,
    setForm,
    saving,
    onSubmit,
    onClose,
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Create New Ticket
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fill in the ticket details and submit it to the system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-slate-100 px-3 py-1 text-lg font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            Title
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(event) =>
                                setForm({ ...form, title: event.target.value })
                            }
                            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter ticket title"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(event) =>
                                setForm({ ...form, description: event.target.value })
                            }
                            className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Describe the issue"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            Priority
                        </label>
                        <select
                            value={form.priority}
                            onChange={(event) =>
                                setForm({ ...form, priority: event.target.value })
                            }
                            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? "Creating..." : "Create Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}