import "./bootstrap";
import "../css/app.css";

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

import {
    formatTicketLabel,
    getTicketCloseError,
} from "./ticketHelpers";

const statuses = [
    { value: "", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "closed", label: "Closed" },
];

const priorities = [
    { value: "", label: "All priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

function App() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        status: "",
        priority: "",
    });

    const [sort, setSort] = useState({
        sort_by: "created_at",
        sort_direction: "desc",
    });

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "medium",
    });

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 4000);
    };

    const showError = (text) => {
        setError(text);
        setTimeout(() => setError(""), 5000);
    };

    const loadTickets = async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                sort_by: sort.sort_by,
                sort_direction: sort.sort_direction,
            };

            if (filters.status) {
                params.status = filters.status;
            }

            if (filters.priority) {
                params.priority = filters.priority;
            }

            const response = await axios.get("/api/tickets", { params });
            setTickets(response.data.data || []);
        } catch (err) {
            showError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [filters.status, filters.priority, sort.sort_by, sort.sort_direction]);

    const stats = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter((ticket) => ticket.status === "open").length,
            inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
            closed: tickets.filter((ticket) => ticket.status === "closed").length,
            high: tickets.filter((ticket) => ticket.priority === "high").length,
        };
    }, [tickets]);

    const handleCreate = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await axios.post("/api/tickets", form);

            setForm({
                title: "",
                description: "",
                priority: "medium",
            });

            setIsCreateModalOpen(false);
            showMessage("Ticket created successfully.");
            await loadTickets();
        } catch (err) {
            showError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (ticket, status) => {
        setError("");
        setMessage("");

        if (status === "closed") {
            const closeError = getTicketCloseError(ticket);

            if (closeError) {
                showError(closeError);
                return;
            }
        }

        try {
            await axios.patch(`/api/tickets/${ticket.id}/status`, { status });

            showMessage("Ticket status updated successfully.");
            await loadTickets();
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const handleSort = (field) => {
        setSort((current) => ({
            sort_by: field,
            sort_direction:
                current.sort_by === field && current.sort_direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    const sortIcon = (field) => {
        if (sort.sort_by !== field) {
            return "↕";
        }

        return sort.sort_direction === "asc" ? "↑" : "↓";
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
            <div className="mx-auto max-w-[1500px]">
                <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                Laravel + React
                            </p>
                            <h1 className="text-3xl font-bold">
                                Ticket Management System
                            </h1>
                            <p className="mt-2 text-slate-600">
                                Manage tickets, filter by status and priority,
                                create new tickets, and update ticket statuses.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadTickets}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-700 disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Refresh"}
                        </button>
                    </div>
                </header>

                <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Total" value={stats.total} />
                    <StatCard label="Open" value={stats.open} />
                    <StatCard label="In Progress" value={stats.inProgress} />
                    <StatCard label="Closed" value={stats.closed} />
                    <StatCard label="High Priority" value={stats.high} />
                </section>

                {message && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
                        {error}
                    </div>
                )}

                <div className="grid gap-6">
                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Tickets</h2>
                                <p className="text-sm text-slate-500">
                                    Filter tickets, sort columns, and update
                                    statuses directly from the table.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                                >
                                    Create Ticket
                                </button>

                                <select
                                    value={filters.status}
                                    onChange={(event) =>
                                        setFilters({
                                            ...filters,
                                            status: event.target.value,
                                        })
                                    }
                                    className="rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {statuses.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={filters.priority}
                                    onChange={(event) =>
                                        setFilters({
                                            ...filters,
                                            priority: event.target.value,
                                        })
                                    }
                                    className="rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {priorities.map((priority) => (
                                        <option
                                            key={priority.value}
                                            value={priority.value}
                                        >
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-100">
                            <table className="w-full table-fixed text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-sm text-slate-600">
                                        <th className="w-16 px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Ticket</th>

                                        <th className="w-32 px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("priority")}
                                                className="flex items-center gap-2 font-bold hover:text-blue-600"
                                            >
                                                Priority{" "}
                                                <span>{sortIcon("priority")}</span>
                                            </button>
                                        </th>

                                        <th className="w-32 px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("status")}
                                                className="flex items-center gap-2 font-bold hover:text-blue-600"
                                            >
                                                Status{" "}
                                                <span>{sortIcon("status")}</span>
                                            </button>
                                        </th>

                                        <th className="w-40 px-4 py-3">
                                            Assigned
                                        </th>

                                        <th className="w-44 px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSort("created_at")}
                                                className="flex items-center gap-2 font-bold hover:text-blue-600"
                                            >
                                                Created{" "}
                                                <span>{sortIcon("created_at")}</span>
                                            </button>
                                        </th>

                                        <th className="w-44 px-4 py-3">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-4 py-8 text-center text-slate-500"
                                            >
                                                Loading tickets...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && tickets.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-4 py-8 text-center text-slate-500"
                                            >
                                                No tickets found.
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        tickets.map((ticket) => (
                                            <tr
                                                key={ticket.id}
                                                className="border-t border-slate-100 transition hover:bg-blue-50/40"
                                            >
                                                <td className="px-4 py-4 align-top font-semibold text-slate-700">
                                                    #{ticket.id}
                                                </td>

                                                <td className="px-4 py-4 align-top">
                                                    <div className="font-semibold text-slate-900">
                                                        {ticket.title}
                                                    </div>

                                                    <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                                                        {ticket.description || "No description"}
                                                    </div>

                                                    {ticket.handled_at && (
                                                        <div className="mt-2 text-xs text-slate-400">
                                                            Handled at: {ticket.handled_at}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 align-top">
                                                    <Badge value={ticket.priority} type="priority" />
                                                </td>

                                                <td className="px-4 py-4 align-top">
                                                    <Badge value={ticket.status} type="status" />
                                                </td>

                                                <td className="px-4 py-4 align-top text-sm text-slate-600">
                                                    {ticket.assigned_user?.name || (
                                                        <span className="text-slate-400">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 align-top text-sm text-slate-600">
                                                    {ticket.created_at || "-"}
                                                </td>

                                                <td className="px-4 py-4 align-top">
                                                    <select
                                                        value={ticket.status}
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                ticket,
                                                                event.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                    >
                                                        <option value="open">Open</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                    onClick={() => setIsCreateModalOpen(false)}
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
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-full bg-slate-100 px-3 py-1 text-lg font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            title: event.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            description: event.target.value,
                                        })
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
                                        setForm({
                                            ...form,
                                            priority: event.target.value,
                                        })
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
                                    onClick={() => setIsCreateModalOpen(false)}
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
            )}
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="text-sm font-semibold text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
                {value}
            </div>
        </div>
    );
}

function Badge({ value, type }) {
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

function getErrorMessage(error) {
    const response = error.response;

    if (response?.data?.errors) {
        return Object.values(response.data.errors).flat().join(" ");
    }

    if (response?.data?.message) {
        return response.data.message;
    }

    return "Something went wrong. Please try again.";
}

createRoot(document.getElementById("root")).render(<App />);