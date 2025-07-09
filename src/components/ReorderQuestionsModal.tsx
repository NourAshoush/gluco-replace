"use client";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MdDragHandle, MdSave, MdClose } from "react-icons/md";

export default function ReorderQuestionsModal({
    questions,
    onClose,
}: {
    questions: any[];
    onClose: (updated?: boolean | any[]) => void;
}) {
    const [items, setItems] = useState([...questions]);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex((q) => q.name === active.id);
            const newIndex = items.findIndex((q) => q.name === over.id);
            setItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const reordered = items.map((q, i) => ({ ...q, order: i + 1 }));

        const { data, error } = await supabase
            .from("questions")
            .upsert(reordered, { onConflict: "name" });

        const { data: updated } = await supabase
            .from("questions")
            .select("*")
            .order("order");

        setLoading(false);
        onClose(updated || []);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-green">
                Reorder Questions
            </h2>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((q) => q.name)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {items.map((q) => (
                            <SortableItem
                                key={q.name}
                                id={q.name}
                                label={q.question_en}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="mt-6 flex justify-between">
                <button
                    onClick={() => onClose()}
                    className="btn-black text-sm px-4 py-2 border rounded flex items-center gap-2"
                >
                    <MdClose size={16} />
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="btn-green text-sm px-4 py-2 border rounded flex items-center gap-2"
                >
                    <MdSave size={16} />
                    Save Order
                </button>
            </div>
        </div>
    );
}

function SortableItem({ id, label }: { id: string; label: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center justify-between border border-gray-300 rounded p-3 bg-white shadow-sm"
        >
            <div className="text-gray-800 font-medium">{label}</div>
            <button
                {...listeners}
                className="cursor-grab text-gray-400 hover:text-gray-600"
            >
                <MdDragHandle size={20} />
            </button>
        </div>
    );
}
