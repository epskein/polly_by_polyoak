// src/pages/ProminentInventory/components/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import { Product } from '../types';

interface KanbanBoardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addAuditLog: (action: string) => void;
}

interface KanbanProduct extends Product {
  paletteIndex: number;
}

const ALLOWED_MOVEMENTS = {
  'SOH PROMINENT': ['TO REPLENISH'],
  'TO REPLENISH': ['IN TRANSIT TO PROMINENT'],
  'IN TRANSIT TO PROMINENT': ['SOH PROMINENT'],
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ products, setProducts, addAuditLog }) => {
  const [columns, setColumns] = useState<{ [key: string]: KanbanProduct[] }>({
    'SOH PROMINENT': [],
    'TO REPLENISH': [],
    'IN TRANSIT TO PROMINENT': [],
  });

  const [dragStartContainer, setDragStartContainer] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Create multiple cards for each product based on the number of palettes
    const expandedProducts = products.flatMap(product => 
      Array.from({ length: product.palettes }, (_, index) => ({
        ...product,
        paletteIndex: index + 1,
        id: `${product.id}-${index + 1}` // Create unique IDs for each palette
      }))
    );

    setColumns(prev => ({ ...prev, 'SOH PROMINENT': expandedProducts }));
  }, [products]);

  const isMovementAllowed = (from: string, to: string): boolean => {
    const allowedDestinations = ALLOWED_MOVEMENTS[from as keyof typeof ALLOWED_MOVEMENTS];
    return allowedDestinations?.includes(to) || false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeContainer = findContainer(active.id as string);
    if (activeContainer) {
      setDragStartContainer(activeContainer);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string) || over.id;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer ||
      typeof overContainer !== 'string'
    ) {
      return;
    }

    // Check if the movement is allowed
    if (!isMovementAllowed(activeContainer, overContainer)) {
      return;
    }

    setColumns(prev => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer as string];

      const activeIndex = activeItems.findIndex(item => item.id === active.id);
      const item = activeItems[activeIndex];

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item.id !== active.id),
        ],
        [overContainer as string]: [...overItems, item],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string) || over.id;

    if (
      !activeContainer ||
      !overContainer ||
      typeof overContainer !== 'string'
    ) {
      return;
    }

    // Check if the movement is allowed
    if (!isMovementAllowed(activeContainer, overContainer) && activeContainer !== overContainer) {
      // If movement is not allowed, revert the drag
      return;
    }

    const activeIndex = columns[activeContainer].findIndex(
      item => item.id === active.id
    );
    const overIndex = columns[overContainer].findIndex(
      item => item.id === over.id
    );

    const item = columns[activeContainer][activeIndex];
    const timestamp = new Date().toLocaleTimeString();
    const user = 'admin@polly.com'; // This would come from auth context in a real app

    if (activeContainer === overContainer) {
      // Reordering within the same column
      setColumns(prev => ({
        ...prev,
        [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
      }));

      // Log reordering within the same column
      addAuditLog(
        `[${timestamp}] ${user} moved Palette ${item.paletteIndex} of ${item.description} ` +
        `(Stock: ${item.stockCode}) to ${activeContainer}`
      );
    } else {
      // Moving to a different column
      setColumns(prev => ({
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item.id !== active.id),
        ],
        [overContainer]: [...prev[overContainer], item],
      }));

      // Log movement between columns
      addAuditLog(
        `[${timestamp}] ${user} moved Palette ${item.paletteIndex} of ${item.description} ` +
        `(Stock: ${item.stockCode}) from ${activeContainer} to ${overContainer}`
      );
    }

    setDragStartContainer(null);
  };

  const findContainer = (id: string) => {
    return Object.keys(columns).find(key => 
      columns[key].some(item => item.id === id)
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(columns).map(([columnId, columnProducts]) => (
          <KanbanColumn
            key={columnId}
            id={columnId}
            title={columnId}
            products={columnProducts}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
