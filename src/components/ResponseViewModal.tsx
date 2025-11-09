"use client";
import { useEffect } from "react";
import dayjs from "dayjs";

export default function ResponseViewModal({
    response,
    onClose,
    pharmacyNameByAccount,
}: {
    response: {
        id: number;
        submitted_at: string;
        response_data: Record<string, any>;
        code: string;
        resolved: boolean;
        resolved_at: string | null;
        resolved_by: string | null;
        last_seen_at: string | null;
        last_seen_by: string | null;
    };
    onClose: () => void;
    pharmacyNameByAccount: Record<string, string>;
}) {
    const resolvedByName = response.resolved_by
        ? pharmacyNameByAccount[response.resolved_by] || "Deleted account"
        : null;
    const lastSeenByName = response.last_seen_by
        ? pharmacyNameByAccount[response.last_seen_by] || "Deleted account"
        : null;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="w-full max-w-6xl mx-auto p-8 relative min-h-[500px]">
            {/* Title bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                            response.resolved
                                ? "bg-green bg-opacity-20 text-white"
                                : "bg-red-600/10 text-red-700"
                        }`}
                    >
                        {response.resolved ? "Completed" : "Pending"}
                    </span>
                    <div className="text-lg font-semibold text-gray-900">
                        {dayjs(response.submitted_at).format("DD MMM YYYY, HH:mm")}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="btn-black px-4 py-2 text-sm rounded"
                    aria-label="Close"
                >
                    Close
                </button>
            </div>

            {/* Summary */}
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-base text-gray-700">Code:</span>
                        <span className="font-mono text-base bg-gray-100 rounded px-3 py-1">
                            {response.code}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {response.last_seen_at && (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                Last Seen By: {lastSeenByName || "Deleted account"}
                            </span>
                        )}
                        {response.resolved_at && (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                Resolved By: {resolvedByName || "Deleted account"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline row */}
            <div className="text-sm text-gray-800 mb-6 flex items-center gap-4 bg-gray-100 rounded-md px-5 py-3 border border-gray-200">
                <div>
                    <span className="font-medium">Submitted</span> {dayjs(response.submitted_at).format("DD MMM YYYY, HH:mm")}
                </div>
                <span className="text-gray-500">→</span>
                <div>
                    <span className="font-medium">Resolved</span> {response.resolved_at ? dayjs(response.resolved_at).format("DD MMM YYYY, HH:mm") : "—"}
                </div>
                <span className="text-gray-500">→</span>
                <div>
                    <span className="font-medium">Last Seen</span> {response.last_seen_at ? dayjs(response.last_seen_at).format("DD MMM YYYY, HH:mm") : "—"}
                </div>
            </div>

            {/* Form data grid */}
            <h3 className="text-xl font-semibold mb-3 text-green">Form Data</h3>
            <div className="max-h-[60vh] overflow-y-auto border rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    {Object.entries(response.response_data).map(([field, value], idx) => (
                        <div
                            key={field}
                            className={`p-4 ${idx % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                        >
                            <div className="text-sm uppercase tracking-wide text-gray-500">
                                {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>
                            <div className="mt-2 text-gray-800 whitespace-pre-wrap break-words text-base">
                                {String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer intentionally removed (close in title bar) */}
        </div>
    );
}
