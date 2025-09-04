import React, { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Config ---
const COLUMN_ORDER = ["todo", "inprogress", "done"];
const COLUMN_TITLES = { todo: "Todo", inprogress: "In Progress", done: "Done" };

function makeId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function TaskCard({ title, onDelete, dragHandleProps, isDragging, showHandle = true }) {
  return (
    <div
      style={{
        padding: 12,
        margin: "6px 0",
        background: "#f8fafc",
        border: "1px solid #d1d5db",
        borderRadius: 10,
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        userSelect: "none",
      }}
    >
      {showHandle && (
        <button
          {...(dragHandleProps || {})}
          aria-label="Drag"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            cursor: "grab",
            background: "white",
          }}
        >
          ⋮
        </button>
      )}

      <div style={{ flex: 1 }}>{title}</div>

      <button
        onClick={onDelete}
        title="Delete task"
        style={{
          border: "none",
          background: "transparent",
          color: "#ef4444",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 16,
          padding: 4,
        }}
      >
        ❌
      </button>
    </div>
  );
}

function SortableTask({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition: transition || "transform 150ms ease",
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        title={task.title}
        onDelete={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          onDelete(task.id);
        }}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        showHandle
      />
    </div>
  );
}

function Column({ id, items, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 320,
        minWidth: 320,
        maxWidth: 320,
        background: isOver ? "#e6f7ff" : "#eef2ff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: 8 }}>{COLUMN_TITLES[id]}</h3>

      <div style={{ flex: 1 }}>
        <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {items.map((task) => (
            <SortableTask key={task.id} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function App() {
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem("kanban-columns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      todo: [
        { id: makeId(), title: "Write project brief" },
        { id: makeId(), title: "Set up repo" },
        { id: makeId(), title: "Draft UI" },
      ],
      inprogress: [{ id: makeId(), title: "API integration" }],
      done: [{ id: makeId(), title: "Create wireframes" }],
    };
  });

  const [newTask, setNewTask] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    localStorage.setItem("kanban-columns", JSON.stringify(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id) => {
    if (!id) return null;
    if (COLUMN_ORDER.includes(id)) return id;
    return COLUMN_ORDER.find((colId) => columns[colId].some((t) => t.id === id)) || null;
  };

  const getIndex = (containerId, taskId) => {
    return columns[containerId].findIndex((t) => t.id === taskId);
  };

  const activeTask = useMemo(() => {
    const col = findContainer(activeId);
    if (!col) return null;
    return columns[col].find((t) => t.id === activeId) || null;
  }, [activeId, columns]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const fromContainer = findContainer(active.id);
    const toContainer = findContainer(over.id);
    if (!fromContainer || !toContainer) return;

    if (fromContainer === toContainer) {
      const oldIndex = getIndex(fromContainer, active.id);
      const newIndex = getIndex(toContainer, over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      if (oldIndex !== newIndex) {
        setColumns((prev) => ({
          ...prev,
          [fromContainer]: arrayMove(prev[fromContainer], oldIndex, newIndex),
        }));
      }
    } else {
      setColumns((prev) => {
        const fromItems = [...prev[fromContainer]];
        const toItems = [...prev[toContainer]];

        const fromIndex = fromItems.findIndex((t) => t.id === active.id);
        const isOverAContainer = COLUMN_ORDER.includes(over.id);
        const toIndex = isOverAContainer ? toItems.length : toItems.findIndex((t) => t.id === over.id);

        if (fromIndex === -1 || (toIndex === -1 && !isOverAContainer)) return prev;

        const [moved] = fromItems.splice(fromIndex, 1);
        toItems.splice(toIndex, 0, moved);

        return { ...prev, [fromContainer]: fromItems, [toContainer]: toItems };
      });
    }
  };

  const handleDeleteTask = (taskId) => {
    setColumns((prev) => {
      const updated = {};
      for (const col of COLUMN_ORDER) {
        updated[col] = prev[col].filter((t) => t.id !== taskId);
      }
      return updated;
    });
  };

  const handleAddTask = () => {
    const title = newTask.trim();
    if (!title) return;
    setColumns((prev) => ({ ...prev, todo: [...prev.todo, { id: makeId(), title }] }));
    setNewTask("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        background: "linear-gradient(to right, #3b82f6, #9333ea)",
      }}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
          style={{ flex: 1, padding: 10, border: "1px solid #d1d5db", borderRadius: 10 }}
        />
        <button
          onClick={handleAddTask}
          style={{ padding: "10px 14px", border: "none", borderRadius: 10, background: "#3b82f6", color: "white", fontWeight: 600, cursor: "pointer" }}
        >
          Add Task
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 46, overflowX: "auto", justifyContent:"center" }}>
          {COLUMN_ORDER.map((colId) => (
            <Column key={colId} id={colId} items={columns[colId]} onDelete={handleDeleteTask} />
          ))}
        </div>

        <DragOverlay>{activeTask ? <TaskCard title={activeTask.title} showHandle={false} isDragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
