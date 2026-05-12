import React from "react";

export default function TicketPagination({
    page,
    setPage,
    perPage,
    setPerPage,
    pagination,
    loading,
}) {
    return (
        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-slate-500">
                Showing page{" "}
                <span className="font-semibold text-slate-800">
                    {pagination.current_page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                    {pagination.last_page}
                </span>{" "}
                - total{" "}
                <span className="font-semibold text-slate-800">
                    {pagination.total}
                </span>{" "}
                tickets
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                    value={perPage}
                    onChange={(event) => {
                        setPage(1);
                        setPerPage(Number(event.target.value));
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                </select>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <select
                        value={page}
                        onChange={(event) => setPage(Number(event.target.value))}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        disabled={loading}
                    >
                        {Array.from({ length: pagination.last_page }, (_, index) => {
                            const pageNumber = index + 1;

                            return (
                                <option key={pageNumber} value={pageNumber}>
                                    Page {pageNumber}
                                </option>
                            );
                        })}
                    </select>

                    <button
                        type="button"
                        disabled={page >= pagination.last_page || loading}
                        onClick={() =>
                            setPage((current) =>
                                Math.min(current + 1, pagination.last_page)
                            )
                        }
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}