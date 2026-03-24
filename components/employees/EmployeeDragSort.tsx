"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Employee {
  name: string;
}

interface EmployeeDragSortProps {
  employees: string[];
  onReorder: (employees: string[]) => void;
}

function SortableItem({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-white border rounded-lg mb-2"
    >
      <span className="font-medium">{id}</span>
      <button
        {...attributes}
        {...listeners}
        className="p-1 hover:bg-gray-100 rounded cursor-grab"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  );
}

export function EmployeeDragSort({ employees, onReorder }: EmployeeDragSortProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = employees.indexOf(active.id as string);
      const newIndex = employees.indexOf(over.id as string);
      const newOrder = arrayMove(employees, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={employees}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {employees.map((name) => (
            <SortableItem key={name} id={name} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
