import "./bootstrap";
import "../css/app.css";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

import { getTicketCloseError } from "./ticketHelpers";
import StatCard from "./components/StatCard";
import TicketTable from "./components/TicketTable";
import TicketPagination from "./components/TicketPagination";
import TicketCreateModal from "./components/TicketCreateModal";

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
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        in_progress: 0,
        closed: 0,
        high: 0,
    });

    const [filters, setFilters] = useState({
        status: "",
        priority: "",
        assigned_user_id: "",
    });

    const [sort, setSort] = useState({
        sort_by: "created_at",
        sort_direction: "desc",
    });

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
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

    const loadUsers = async () => {
        try {
            const response = await axios.get("/api/users");
            setUsers(response.data.data || []);
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const loadStats = async () => {
        try {
            const response = await axios.get("/api/tickets/stats");

            setStats(
                response.data.data || {
                    total: 0,
                    open: 0,
                    in_progress: 0,
                    closed: 0,
                    high: 0,
                },
            );
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const loadTickets = async (pageToLoad = page) => {
        setLoading(true);
        setError("");

        try {
            const params = {
                sort_by: sort.sort_by,
                sort_direction: sort.sort_direction,
                page: pageToLoad,
                per_page: perPage,
            };

            if (filters.status) {
                params.status = filters.status;
            }

            if (filters.priority) {
                params.priority = filters.priority;
            }

            if (filters.assigned_user_id) {
                params.assigned_user_id = filters.assigned_user_id;
            }

            const response = await axios.get("/api/tickets", { params });

            setTickets(response.data.data || []);

            if (response.data.meta) {
                setPagination({
                    current_page: response.data.meta.current_page,
                    last_page: response.data.meta.last_page,
                    per_page: response.data.meta.per_page,
                    total: response.data.meta.total,
                });
            }
        } catch (err) {
            showError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        loadStats();
    }, []);

    useEffect(() => {
        loadTickets(page);
    }, [
        filters.status,
        filters.priority,
        filters.assigned_user_id,
        sort.sort_by,
        sort.sort_direction,
        page,
        perPage,
    ]);

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
            setPage(1);
            showMessage("Ticket created successfully.");

            await loadTickets(1);
            await loadStats();
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
            await loadTickets(page);
            await loadStats();
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const handleAssignUser = async (ticket, userId) => {
        setError("");
        setMessage("");

        try {
            await axios.patch(`/api/tickets/${ticket.id}/assign`, {
                assigned_user_id: userId ? Number(userId) : null,
            });

            showMessage(
                userId
                    ? "Ticket assigned successfully."
                    : "Ticket unassigned successfully.",
            );

            await loadTickets(page);
            await loadStats();
        } catch (err) {
            showError(getErrorMessage(err));
        }
    };

    const handleSort = (field) => {
        setPage(1);

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
                            onClick={() => {
                                loadTickets(page);
                                loadStats();
                            }}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-700 disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Refresh"}
                        </button>
                    </div>
                </header>

                <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard label="Total Tickets" value={stats.total} />
                    <StatCard label="Open" value={stats.open} />
                    <StatCard label="In Progress" value={stats.in_progress} />
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
                                    Filter tickets, sort columns, update
                                    statuses, assign users, and move between
                                    pages.
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
                                    onChange={(event) => {
                                        setPage(1);
                                        setFilters({
                                            ...filters,
                                            status: event.target.value,
                                        });
                                    }}
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
                                    onChange={(event) => {
                                        setPage(1);
                                        setFilters({
                                            ...filters,
                                            priority: event.target.value,
                                        });
                                    }}
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

                                <select
                                    value={filters.assigned_user_id}
                                    onChange={(event) => {
                                        setPage(1);
                                        setFilters({
                                            ...filters,
                                            assigned_user_id:
                                                event.target.value,
                                        });
                                    }}
                                    className="rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">All users</option>

                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <TicketTable
                            tickets={tickets}
                            loading={loading}
                            users={users}
                            sortIcon={sortIcon}
                            handleSort={handleSort}
                            handleStatusChange={handleStatusChange}
                            handleAssignUser={handleAssignUser}
                        />

                        <TicketPagination
                            page={page}
                            setPage={setPage}
                            perPage={perPage}
                            setPerPage={setPerPage}
                            pagination={pagination}
                            loading={loading}
                        />
                    </section>
                </div>
            </div>

            {isCreateModalOpen && (
                <TicketCreateModal
                    form={form}
                    setForm={setForm}
                    saving={saving}
                    onSubmit={handleCreate}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
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