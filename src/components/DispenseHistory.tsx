"use client";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { FaTimes, FaSpinner } from "react-icons/fa";
import MainHeader from "./MainHeader";
import { useLanguage } from "@/context/LanguageContext";

interface DispenseRecord {
    code: string;
    resolved_at: string;
}

interface DispenseHistoryProps {
    onClose: () => void;
}

export default function DispenseHistory({ onClose }: DispenseHistoryProps) {
    const supabase = createClient();
    const { language } = useLanguage();
    const isArabic = language === "ar";
    const [records, setRecords] = useState<DispenseRecord[]>([]);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const pageSize = 10;
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: userRes } = await supabase.auth.getUser();
            const userId = userRes?.user?.id;
            if (!userId) {
                setRecords([]);
                setLoading(false);
                return;
            }
            let query = supabase
                .from("responses")
                .select("code, resolved_at", { count: "exact" })
                .eq("resolved_by", userId);
            if (fromDate) {
                query = query.gte(
                    "resolved_at",
                    dayjs(fromDate).startOf("day").toISOString()
                );
            }
            if (toDate) {
                query = query.lte(
                    "resolved_at",
                    dayjs(toDate).endOf("day").toISOString()
                );
            }
            const from = (page - 1) * pageSize;
            const to = page * pageSize - 1;
            const { data, count, error } = await query
                .order("resolved_at", { ascending: false })
                .range(from, to);
            if (!error && data) {
                setRecords(data);
                setTotal(count ?? 0);
            }
            setLoading(false);
        };
        fetchData();
    }, [fromDate, toDate, page]);

    // Group records by day
    const grouped = records.reduce<Record<string, DispenseRecord[]>>(
        (acc, rec) => {
            const day = dayjs(rec.resolved_at).format("YYYY-MM-DD");
            if (!acc[day]) acc[day] = [];
            acc[day].push(rec);
            return acc;
        },
        {}
    );

    return (
        <>
            {/* <MainHeader /> */}
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        {isArabic ? "سجل الصرف" : "Dispense History"}
                    </h1>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-black cursor-pointer"
                        aria-label={isArabic ? "إغلاق" : "Close"}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>
                <div className="flex gap-4 mb-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {isArabic ? "من:" : "From:"}
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
                            {isArabic ? "إلى:" : "To:"}
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
                            setPage(1);
                        }}
                        className="btn-black ml-4 px-3 py-2 rounded text-sm cursor-pointer"
                    >
                        {isArabic ? "عرض الكل" : "View All Time"}
                    </button>
                </div>
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <FaSpinner className="animate-spin text-green text-4xl" />
                        </div>
                    ) : records.length === 0 ? (
                        <p className="text-center text-gray-500">
                            {isArabic
                                ? "لا توجد معاملات."
                                : "No transactions found."}
                        </p>
                    ) : (
                        Object.keys(grouped)
                            .sort(
                                (a, b) =>
                                    dayjs(b).valueOf() - dayjs(a).valueOf()
                            )
                            .map((day) => (
                                <div key={day}>
                                    <h3 className="text-lg font-bold text-green mb-2">
                                        {dayjs(day).format("dddd, D MMMM YYYY")}
                                    </h3>
                                    <ul className="divide-y">
                                        {grouped[day].map((rec) => (
                                            <li
                                                key={rec.resolved_at + rec.code}
                                                className="flex justify-between py-1"
                                            >
                                                <span>
                                                    {dayjs(
                                                        rec.resolved_at
                                                    ).format("h:mm A")}
                                                </span>
                                                <span>{rec.code}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                    )}
                </div>
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="btn-black px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
                    >
                        {isArabic ? "السابق" : "Previous"}
                    </button>
                    <span>
                        {isArabic
                            ? `صفحة ${page} من ${Math.ceil(total / pageSize)}`
                            : `Page ${page} of ${Math.ceil(total / pageSize)}`}
                    </span>
                    <button
                        onClick={() =>
                            setPage((p) => (p * pageSize < total ? p + 1 : p))
                        }
                        disabled={page * pageSize >= total}
                        className="btn-black px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
                    >
                        {isArabic ? "التالي" : "Next"}
                    </button>
                </div>
            </div>
        </>
    );
}
