"use client";
import dayjs from "dayjs";
import { MdClose } from "react-icons/md";

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
                {response.resolved_at && (
                    <div>
                        <strong>Resolved By:</strong>{" "}
                        {resolvedByName || "Deleted account"}
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
                {response.last_seen_at && (
                    <div>
                        <strong>Last Seen By:</strong>{" "}
                        {lastSeenByName || "Deleted account"}
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
