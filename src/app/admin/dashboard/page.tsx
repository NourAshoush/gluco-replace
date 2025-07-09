"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dayjs from "dayjs";

const TIMEFRAMES = [1, 6, 12, 24, 48, 72]; // in hours

export default function AdminDashboardPage() {
    const supabase = createClientComponentClient();
    const [hours, setHours] = useState(6);
    const [submittedCount, setSubmittedCount] = useState(0);
    const [resolvedCount, setResolvedCount] = useState(0);
    const [timelineData, setTimelineData] = useState<number[]>([]);

    useEffect(() => {
        async function fetchStats() {
            const since = dayjs().subtract(hours, "hour").toISOString();

            // Count submitted in timeframe
            const { count: subCount } = await supabase
                .from("responses")
                .select("id", { count: "exact" })
                .gt("submitted_at", since);

            // Count resolved in timeframe
            const { count: resCount } = await supabase
                .from("responses")
                .select("id", { count: "exact" })
                .gt("resolved_at", since)
                .eq("resolved", true);

            setSubmittedCount(subCount || 0);
            setResolvedCount(resCount || 0);

            // Pull timestamps for timeline
            const { data: subs } = await supabase
                .from("responses")
                .select("submitted_at")
                .gt("submitted_at", since)
                .order("submitted_at", { ascending: true });

            // Bucket per hour
            const buckets = Array(hours).fill(0);
            subs?.forEach((r) => {
                const diff = dayjs().diff(dayjs(r.submitted_at), "hour");
                if (diff >= 0 && diff < hours) {
                    buckets[hours - 1 - diff]++;
                }
            });
            setTimelineData(buckets);
        }

        fetchStats();
    }, [hours]);

    const maxVal = Math.max(1, ...timelineData);

    return (
        <div className="p-6 space-y-6">
            {/* Timeframe selector */}
            <div className="flex items-center gap-3">
                <label className="font-medium">Show last</label>
                <select
                    className="border rounded p-2"
                    value={hours}
                    onChange={(e) => setHours(+e.target.value)}
                >
                    {TIMEFRAMES.map((h) => (
                        <option key={h} value={h}>
                            {h}h
                        </option>
                    ))}
                </select>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                    <h2 className="text-gray-700 font-semibold mb-2">
                        Complaints Submitted
                    </h2>
                    <div className="text-green text-4xl font-bold">
                        {submittedCount}
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                    <h2 className="text-gray-700 font-semibold mb-2">
                        Replacements Issued
                    </h2>
                    <div className="text-green text-4xl font-bold">
                        {resolvedCount}
                    </div>
                </div>
            </div>

            {/* Timeline sparkline */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                    Submissions Over Time
                </h3>
                <div className="flex items-end h-24 gap-1 overflow-x-auto">
                    {timelineData.map((val, i) => (
                        <div
                            key={i}
                            className="bg-green transition-all"
                            style={{
                                flex: 1,
                                height: `${(val / maxVal) * 100}%`,
                            }}
                            title={`${val} submissions`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                        {dayjs().subtract(hours, "hour").format("HH:mm")}
                    </span>
                    <span>{dayjs().format("HH:mm")}</span>
                </div>
            </div>
        </div>
    );
}
