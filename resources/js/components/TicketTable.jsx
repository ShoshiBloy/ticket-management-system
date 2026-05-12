import React from "react";
import Badge from "./Badge";

export default function TicketTable({
    tickets,
    loading,
    users,
    sortIcon,
    handleSort,
    handleStatusChange,
    handleAssignUser,
}) {
    return (
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
                                Priority <span>{sortIcon("priority")}</span>
                            </button>
                        </th>

                        <th className="w-32 px-4 py-3">
                            <button
                                type="button"
                                onClick={() => handleSort("status")}
                                className="flex items-center gap-2 font-bold hover:text-blue-600"
                            >
                                Status <span>{sortIcon("status")}</span>
                            </button>
                        </th>

                        <th className="w-56 px-4 py-3">Assigned</th>

                        <th className="w-44 px-4 py-3">
                            <button
                                type="button"
                                onClick={() => handleSort("created_at")}
                                className="flex items-center gap-2 font-bold hover:text-blue-600"
                            >
                                Created <span>{sortIcon("created_at")}</span>
                            </button>
                        </th>

                        <th className="w-44 px-4 py-3">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                Loading tickets...
                            </td>
                        </tr>
                    )}

                    {!loading && tickets.length === 0 && (
                        <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
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

                                <td className="px-4 py-4 align-top">
                                    <select
                                        value={ticket.assigned_user?.id || ""}
                                        onChange={(event) =>
                                            handleAssignUser(ticket, event.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">Unassigned</option>

                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>

                                    {ticket.assigned_user?.email && (
                                        <div className="mt-1 truncate text-xs text-slate-400">
                                            {ticket.assigned_user.email}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-4 align-top text-sm text-slate-600">
                                    {ticket.created_at || "-"}
                                </td>

                                <td className="px-4 py-4 align-top">
                                    <select
                                        value={ticket.status}
                                        onChange={(event) =>
                                            handleStatusChange(ticket, event.target.value)
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
    );
}