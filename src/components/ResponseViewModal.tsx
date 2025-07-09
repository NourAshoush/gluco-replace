"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { MdClose } from "react-icons/md";

export default function ResponseViewModal({
    response,
    onClose,
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
}) {
    const supabase = createClientComponentClient();
    const [resolvedByName, setResolvedByName] = useState<string | null>(null);
    const [lastSeenByName, setLastSeenByName] = useState<string | null>(null);

    useEffect(() => {
        const fetchNames = async () => {
            if (response.resolved_by) {
                const { data } = await supabase
                    .from("pharmacies")
                    .select("pharmacy_name")
                    .eq("pharmacy_account", response.resolved_by)
                    .single();
                setResolvedByName(data?.pharmacy_name || null);
            }
            if (response.last_seen_by) {
                const { data } = await supabase
                    .from("pharmacies")
                    .select("pharmacy_name")
                    .eq("pharmacy_account", response.last_seen_by)
                    .single();
                setLastSeenByName(data?.pharmacy_name || null);
            }
        };
        fetchNames();
    }, [response.resolved_by, response.last_seen_by, supabase]);

    return (
        <div className="max-w-4xl mx-auto p-4 relative min-h-[400px]">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-600 cursor-pointer hover:text-gray-800"
            >
                <MdClose size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Response Details</h2>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div>
                    <strong>Submitted:</strong>{" "}
                    {dayjs(response.submitted_at).format("DD MMM YYYY, HH:mm")}
                </div>
                <div>
                    <strong>Code:</strong> {response.code}
                </div>
                <div>
                    <strong>Resolved:</strong>{" "}
                    {response.resolved ? "Yes" : "No"}
                </div>
                {response.resolved_at && (
                    <div>
                        <strong>Resolved At:</strong>{" "}
                        {dayjs(response.resolved_at).format(
                            "DD MMM YYYY, HH:mm"
                        )}
                    </div>
                )}
                {response.resolved_by && (
                    <div>
                        <strong>Resolved By:</strong>{" "}
                        {resolvedByName || response.resolved_by}
                    </div>
                )}
                {response.last_seen_at && (
                    <div>
                        <strong>Last Seen:</strong>{" "}
                        {dayjs(response.last_seen_at).format(
                            "DD MMM YYYY, HH:mm"
                        )}
                    </div>
                )}
                {response.last_seen_by && (
                    <div>
                        <strong>Last Seen By:</strong>{" "}
                        {lastSeenByName || response.last_seen_by}
                    </div>
                )}
            </div>
            <h3 className="text-lg font-semibold mb-2">Form Data</h3>
            <div className="max-h-64 overflow-y-auto border rounded bg-green-50 p-4">
                {Object.entries(response.response_data).map(
                    ([field, value]) => (
                        <div key={field} className="py-2">
                            <div className="text-gray-700 font-medium">
                                {field
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>
                            <div className="text-gray-800">{String(value)}</div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
