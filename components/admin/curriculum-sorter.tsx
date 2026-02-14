"use client";

import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

type Item = { id: string; label: string };

function Row({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab rounded-2xl cinematic-card p-3"
      {...attributes}
      {...listeners}
    >
      {item.label}
    </div>
  );
}

export function CurriculumSorter({
  title,
  items,
  target
}: {
  title: string;
  items: Item[];
  target: "section" | "lesson";
}) {
  const [state, setState] = useState(items);
  const sensors = useSensors(useSensor(PointerSensor));

  async function persist(list: Item[]) {
    await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, ids: list.map((item) => item.id) })
    });
  }

  return (
    <div className="space-y-2">
      <p className="font-medium">{title}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;
          const oldIndex = state.findIndex((item) => item.id === active.id);
          const newIndex = state.findIndex((item) => item.id === over.id);
          const next = arrayMove(state, oldIndex, newIndex);
          setState(next);
          void persist(next);
        }}
      >
        <SortableContext items={state.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {state.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
