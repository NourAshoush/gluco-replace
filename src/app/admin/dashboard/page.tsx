"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import dayjs from "dayjs";

type TimeframeValue = "today" | "2" | "7" | "30" | "90";
const TIMEFRAMES: Array<{ label: string; value: TimeframeValue }> = [
    { label: "Today", value: "today" },
    { label: "2 days", value: "2" },
    { label: "7 days", value: "7" },
    { label: "30 days", value: "30" },
    { label: "90 days", value: "90" },
];

export default function AdminDashboardPage() {
    const supabase = createClientComponentClient();
    const [timeframe, setTimeframe] = useState<TimeframeValue>("today");
    const [submittedCount, setSubmittedCount] = useState(0);
    const [resolvedCount, setResolvedCount] = useState(0);
    const [timelineData, setTimelineData] = useState<number[]>([]);
    const [resolvedTimeline, setResolvedTimeline] = useState<number[]>([]);
    const [bucketLabels, setBucketLabels] = useState<string[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoverIdxSubmitted, setHoverIdxSubmitted] = useState<number | null>(null);
    const [hoverIdxResolved, setHoverIdxResolved] = useState<number | null>(null);

    const isToday = timeframe === "today";
    const days = isToday ? 0 : parseInt(timeframe, 10);

    async function fetchStats() {
        setLoading(true);
        setError(null);
        try {
            const since = isToday
                ? dayjs().startOf("day").toISOString()
                : dayjs().subtract(days, "day").startOf("day").toISOString();

            const { data: subs, error: subsError } = await supabase
                .from("responses")
                .select("submitted_at")
                .gte("submitted_at", since)
                .order("submitted_at", { ascending: true });
            const { data: res, error: resError } = await supabase
                .from("responses")
                .select("resolved_at")
                .gte("resolved_at", since)
                .eq("resolved", true)
                .order("resolved_at", { ascending: true });

            if (subsError || resError) {
                throw new Error(subsError?.message || resError?.message);
            }

            setSubmittedCount(subs?.length || 0);
            setResolvedCount(res?.length || 0);

            let buckets: number[];
            let labels: string[];
            let rbuckets: number[];
            if (isToday) {
                buckets = Array(24).fill(0);
                labels = Array.from({ length: 24 }, (_, i) =>
                    dayjs().startOf("day").add(i, "hour").format("DD MMM HH:00")
                );
                subs?.forEach((r) => {
                    const hour = dayjs(r.submitted_at).hour();
                    buckets[hour]++;
                });
                rbuckets = Array(24).fill(0);
                res?.forEach((r) => {
                    const hour = dayjs(r.resolved_at).hour();
                    rbuckets[hour]++;
                });
            } else {
                buckets = Array(days).fill(0);
                labels = Array.from({ length: days }, (_, i) =>
                    dayjs()
                        .subtract(days - 1 - i, "day")
                        .startOf("day")
                        .format("DD MMM")
                );
                subs?.forEach((r) => {
                    const diff = dayjs()
                        .startOf("day")
                        .diff(dayjs(r.submitted_at).startOf("day"), "day");
                    if (diff >= 0 && diff < days) {
                        const idx = days - 1 - diff;
                        buckets[idx]++;
                    }
                });
                rbuckets = Array(days).fill(0);
                res?.forEach((r) => {
                    const diff = dayjs()
                        .startOf("day")
                        .diff(dayjs(r.resolved_at).startOf("day"), "day");
                    if (diff >= 0 && diff < days) {
                        const idx = days - 1 - diff;
                        rbuckets[idx]++;
                    }
                });
            }
            setTimelineData(buckets);
            setBucketLabels(labels);
            setResolvedTimeline(rbuckets || Array(labels.length).fill(0));
            setLastUpdated(new Date());
        } catch (e: any) {
            setError(e?.message || "Failed to load stats");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
        const id = setInterval(fetchStats, 60000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeframe]);

    const maxVal = Math.max(1, ...timelineData);
    const resMaxVal = Math.max(1, ...resolvedTimeline);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <label className="font-medium">Show</label>
                <select
                    className="border rounded p-2"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as TimeframeValue)}
                >
                    {TIMEFRAMES.map((tf) => (
                        <option key={tf.value} value={tf.value}>
                            {tf.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className={`px-3 py-2 text-sm rounded border ${
                        loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    }`}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
                {error && (
                    <span className="text-red-600 text-sm">{error}</span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                    <h2 className="text-gray-700 font-semibold mb-2">Complaints Submitted</h2>
                    <div className="text-green text-4xl font-bold">{submittedCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                    <h2 className="text-gray-700 font-semibold mb-2">Replacements Issued</h2>
                    <div className="text-green text-4xl font-bold">{resolvedCount}</div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Submissions Over Time</h3>
                <div className="flex items-stretch gap-2">
                    {/* Y-axis */}
                    <div className="flex flex-col justify-between items-end text-xs text-gray-500 py-1">
                        <span>{maxVal}</span>
                        <span>{Math.max(0, Math.ceil(maxVal / 2))}</span>
                        <span>0</span>
                    </div>
                    {/* Bars with native title tooltip + hover readout */}
                    <div className="relative flex items-end h-48 gap-1 overflow-x-auto flex-1">
                        {/* grid lines */}
                        <div className="pointer-events-none absolute inset-0 z-0">
                            <div className="absolute inset-x-0 top-0 border-t border-gray-200" />
                            <div className="absolute inset-x-0 top-1/2 border-t border-gray-200" />
                            <div className="absolute inset-x-0 bottom-0 border-t border-gray-200" />
                        </div>
                        {timelineData.map((val, i) => (
                            <div
                                key={i}
                                className="bg-green transition-all min-w-[8px] relative z-10"
                                style={{ height: `${(val / maxVal) * 100}%`, flex: 1 }}
                                title={`${bucketLabels[i] || ''} — ${val} submissions`}
                                onMouseEnter={() => setHoverIdxSubmitted(i)}
                                onMouseLeave={() => setHoverIdxSubmitted(null)}
                            />
                        ))}
                        {hoverIdxSubmitted != null && (
                            <div className="pointer-events-none absolute top-1 left-2 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {(bucketLabels[hoverIdxSubmitted] || "")} — {timelineData[hoverIdxSubmitted]} submissions
                            </div>
                        )}
                    </div>
                    
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {isToday ? (
                        <>
                            <span>{dayjs().startOf("day").format("HH:mm")}</span>
                            <span>{dayjs().format("HH:mm")}</span>
                        </>
                    ) : (
                        <>
                            <span>
                                {dayjs().subtract(days, "day").startOf("day").format("DD MMM")}
                            </span>
                            <span>{dayjs().format("DD MMM")}</span>
                        </>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Last updated: {lastUpdated ? dayjs(lastUpdated).format("HH:mm") : "--:--"}
                </div>
            </div>

            {/* Replacements chart */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Replacements Over Time</h3>
                <div className="flex items-stretch gap-2">
                    {/* Y-axis */}
                    <div className="flex flex-col justify-between items-end text-xs text-gray-500 py-1">
                        <span>{resMaxVal}</span>
                        <span>{Math.max(0, Math.ceil(resMaxVal / 2))}</span>
                        <span>0</span>
                    </div>
                    {/* Bars with native title tooltip + hover readout */}
                    <div className="relative flex items-end h-48 gap-1 overflow-x-auto flex-1">
                        {/* grid lines */}
                        <div className="pointer-events-none absolute inset-0 z-0">
                            <div className="absolute inset-x-0 top-0 border-t border-gray-200" />
                            <div className="absolute inset-x-0 top-1/2 border-t border-gray-200" />
                            <div className="absolute inset-x-0 bottom-0 border-t border-gray-200" />
                        </div>
                        {resolvedTimeline.map((val, i) => (
                            <div
                                key={i}
                                className="bg-purple-500 transition-all min-w-[8px] relative z-10"
                                style={{ height: `${(val / resMaxVal) * 100}%`, flex: 1 }}
                                title={`${bucketLabels[i] || ''} — ${val} replacements`}
                                onMouseEnter={() => setHoverIdxResolved(i)}
                                onMouseLeave={() => setHoverIdxResolved(null)}
                            />
                        ))}
                        {hoverIdxResolved != null && (
                            <div className="pointer-events-none absolute top-1 left-2 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {(bucketLabels[hoverIdxResolved] || "")} — {resolvedTimeline[hoverIdxResolved]} replacements
                            </div>
                        )}
                    </div>
                    
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {isToday ? (
                        <>
                            <span>{dayjs().startOf("day").format("HH:mm")}</span>
                            <span>{dayjs().format("HH:mm")}</span>
                        </>
                    ) : (
                        <>
                            <span>
                                {dayjs().subtract(days, "day").startOf("day").format("DD MMM")}
                            </span>
                            <span>{dayjs().format("DD MMM")}</span>
                        </>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Last updated: {lastUpdated ? dayjs(lastUpdated).format("HH:mm") : "--:--"}
                </div>
            </div>
        </div>
    );
}
