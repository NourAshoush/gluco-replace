"use client";
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const from = (page - 1) * pageSize;
            const to = page * pageSize - 1;
            const { data, count, error } = await supabase
                .from("responses")
                .select("*", { count: "exact" })
                .order("submitted_at", { ascending: false })
                .range(from, to);

            if (!error && data) {
                setResponses(data as ResponseRecord[]);
                setTotal(count ?? 0);
            }
            setLoading(false);
        };
        fetchData();
    }, [page, supabase]);

    if (selected) {
        return (
            <ResponseViewModal
                response={selected}
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

    return (
        <>
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
        </>
    );
}
