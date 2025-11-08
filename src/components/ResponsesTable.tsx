// @ts-nocheck
"use client";
import { parse } from "json2csv";
import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ResponseViewModal from "./ResponseViewModal";
import dayjs from "dayjs";

interface ResponseRecord {
    id: number;
    submitted_at: string;
    response_data: Record<string, any>;
    code: string;
    resolved: boolean;
    resolved_at: string | null;
    resolved_by: string | null;
    last_seen_at: string | null;
    last_seen_by: string | null;
}

export default function ResponsesTable() {
    const supabase = createClientComponentClient();
    const [responses, setResponses] = useState<ResponseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 15;
    const [total, setTotal] = useState(0);
    const [selected, setSelected] = useState<ResponseRecord | null>(null);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [pharmacyNameByAccount, setPharmacyNameByAccount] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const from = (page - 1) * pageSize;
            const to = page * pageSize - 1;
            // Compute inclusive date-time strings for date filters
            const fromDateISO = fromDate
                ? dayjs(fromDate).startOf("day").toISOString()
                : null;
            const toDateISO = toDate
                ? dayjs(toDate).endOf("day").toISOString()
                : null;
            let query = supabase
                .from("responses")
                .select("*", { count: "exact" });
            if (fromDateISO) query = query.gte("submitted_at", fromDateISO);
            if (toDateISO) query = query.lte("submitted_at", toDateISO);
            const { data, count, error } = await query
                .order("submitted_at", { ascending: false })
                .range(from, to);

            if (!error && data) {
                setResponses(data as ResponseRecord[]);
                setTotal(count ?? 0);
            }
            setLoading(false);
        };
        fetchData();
    }, [page, supabase, fromDate, toDate]);

    // Fetch all pharmacies once and build a map: pharmacy_account -> pharmacy_name
    useEffect(() => {
        const fetchPharmacies = async () => {
            const { data, error } = await supabase
                .from("pharmacies")
                .select("pharmacy_account, pharmacy_name");
            if (!error && data) {
                const map: Record<string, string> = {};
                data.forEach((p: any) => {
                    if (p.pharmacy_account) map[p.pharmacy_account] = p.pharmacy_name;
                });
                setPharmacyNameByAccount(map);
            }
        };
        fetchPharmacies();
    }, [supabase]);

    if (selected) {
        return (
            <ResponseViewModal
                response={selected}
                pharmacyNameByAccount={pharmacyNameByAccount}
                onClose={() => setSelected(null)}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <FaSpinner className="animate-spin text-green text-4xl" />
            </div>
        );
    }

    const downloadCSV = async () => {
        // Compute inclusive ISO strings
        const fromDateISO = fromDate
            ? dayjs(fromDate).startOf("day").toISOString()
            : null;
        const toDateISO = toDate
            ? dayjs(toDate).endOf("day").toISOString()
            : null;

        // Fetch all filtered rows
        let q = supabase.from("responses").select("*");
        if (fromDateISO) q = q.gte("submitted_at", fromDateISO);
        if (toDateISO) q = q.lte("submitted_at", toDateISO);
        const { data, error } = await q.order("submitted_at", {
            ascending: false,
        });

        if (error || !data) {
            console.error("CSV download error:", error);
            return;
        }

        // Replace user UUIDs with pharmacy names and flatten response_data
        const flattened = data.map(
            ({ id, response_data, resolved_by, last_seen_by, resolved_at, last_seen_at, ...rest }) => {
                const resolvedByName = resolved_at
                    ? (resolved_by ? pharmacyNameByAccount[resolved_by] || "Deleted account" : "Deleted account")
                    : "";
                const lastSeenByName = last_seen_at
                    ? (last_seen_by ? pharmacyNameByAccount[last_seen_by] || "Deleted account" : "Deleted account")
                    : "";
                return {
                    ...rest,
                    // Preserve timestamps in CSV
                    resolved_at,
                    last_seen_at,
                    // Replace IDs with readable names in CSV output
                    resolved_by: resolvedByName,
                    last_seen_by: lastSeenByName,
                    ...response_data,
                };
            }
        );

        // Convert to CSV and download
        const csv = parse(flattened);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "responses.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="flex gap-4 mb-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        From:
                    </label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        To:
                    </label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border rounded p-2 text-sm"
                    />
                </div>
                <button
                    onClick={() => {
                        setFromDate("");
                        setToDate("");
                    }}
                    className="btn-black text-sm rounded block font-medium px-4 py-2"
                >
                    View All Time
                </button>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="min-w-max w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border">Submitted At</th>
                            <th className="px-2 py-1 border">Email</th>
                            <th className="px-2 py-1 border">Mobile</th>
                            <th className="px-2 py-1 border">Code</th>
                            <th className="px-2 py-1 border">Resolved</th>
                            <th className="px-2 py-1 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.map((r) => (
                            <tr key={r.id} className="hover:bg-green-50">
                                <td className="px-2 py-1 border">
                                    {dayjs(r.submitted_at).format(
                                        "DD MMM YYYY, HH:mm"
                                    )}
                                </td>
                                <td className="px-2 py-1 border">
                                    {r.response_data.email || "-"}
                                </td>
                                <td className="px-2 py-1 border">
                                    {r.response_data.mobile || "-"}
                                </td>
                                <td className="px-2 py-1 border font-mono text-center">
                                    {r.code}
                                </td>
                                <td
                                    className={`px-2 py-1 border text-center ${
                                        r.resolved
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {r.resolved ? "Completed" : "Pending"}
                                </td>
                                <td className="px-2 py-1 border text-center">
                                    <button
                                        onClick={() => setSelected(r)}
                                        className="btn-black px-2 py-1 rounded transition"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn-black px-3 py-1 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>
                    Page {page} of {Math.ceil(total / pageSize)}
                </span>
                <button
                    onClick={() =>
                        setPage((p) => (p * pageSize < total ? p + 1 : p))
                    }
                    disabled={page * pageSize >= total}
                    className="btn-black px-3 py-1 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="mt-4">
                <button
                    onClick={downloadCSV}
                    className="btn-green px-3 py-1 rounded"
                >
                    Download CSV
                </button>
            </div>
        </>
    );
}
