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
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import { Product } from '../types';

interface KanbanBoardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addAuditLog: (action: string) => void;
  onMovement: (movement: {
    item: KanbanProduct;
    fromColumn: string;
    toColumn: string;
    timestamp: string;
    columns: { [key: string]: KanbanProduct[] };
    restore: () => void;
  }) => void;
}

interface KanbanProduct extends Product {
  paletteIndex: number;
}

const ALLOWED_MOVEMENTS = {
  'SOH PROMINENT': ['TO REPLENISH'],
  'TO REPLENISH': ['IN TRANSIT TO PROMINENT'],
  'IN TRANSIT TO PROMINENT': ['SOH PROMINENT'],
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ products, setProducts, addAuditLog, onMovement }) => {
  const [columns, setColumns] = useState<{ [key: string]: KanbanProduct[] }>({
    'SOH PROMINENT': [],
    'TO REPLENISH': [],
    'IN TRANSIT TO PROMINENT': [],
  });

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

    // Only update SOH PROMINENT if it's empty or if products have changed
    setColumns(prev => {
      // If there are items in other columns, preserve them
      if (prev['TO REPLENISH'].length > 0 || prev['IN TRANSIT TO PROMINENT'].length > 0) {
        return {
          ...prev,
          'SOH PROMINENT': expandedProducts.filter(newProduct => 
            !Object.values(prev).flat().some(existingProduct => 
              existingProduct.id === newProduct.id
            )
          )
        };
      }
      // Otherwise, just set SOH PROMINENT
      return { ...prev, 'SOH PROMINENT': expandedProducts };
    });
  }, [products]);

  const isMovementAllowed = (from: string, to: string): boolean => {
    const allowedDestinations = ALLOWED_MOVEMENTS[from as keyof typeof ALLOWED_MOVEMENTS];
    return allowedDestinations?.includes(to) || false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeContainer = findContainer(active.id as string);
    if (!activeContainer) return;
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This function is intentionally left empty. 
    // All state updates are handled in `onDragEnd` to ensure consistency and prevent race conditions.
    // Visual feedback during the drag is managed by the dnd-kit's default SortableContext behavior.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log('Drag cancelled, no drop target.');
      return;
    }

    if (active.id === over.id) {
      console.log('Item dropped on itself, no change.');
      return;
    }

    const currentState = JSON.parse(JSON.stringify(columns));
    console.log('Saved current state before drag end:', currentState);

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string) || (over.data.current?.type === 'column' ? over.id as string : findContainer(over.id as string));

    if (!activeContainer || !overContainer) {
      console.error('Could not find active or over container.');
      return;
    }

    if (activeContainer === overContainer) {
      console.log('Reordering within the same column.');
      
      const activeIndex = columns[activeContainer].findIndex(item => item.id === active.id);
      const overIndex = columns[overContainer].findIndex(item => item.id === over.id);

      if (activeIndex === -1 || overIndex === -1) {
        console.error('Could not find item index for reordering.');
        return;
      }
      
      const newColumns = {
        ...columns,
        [activeContainer]: arrayMove(columns[activeContainer], activeIndex, overIndex),
      };

      setColumns(newColumns);
      
      const timestamp = new Date().toLocaleTimeString();
      const user = 'admin@polly.com';
      const logMessage = `[${timestamp}] ${user} reordered Palette ${currentState[activeContainer][activeIndex].paletteIndex} in ${activeContainer}`;
      addAuditLog(logMessage);

      const restore = () => setColumns(currentState);
      onMovement({
        item: currentState[activeContainer][activeIndex],
        fromColumn: activeContainer,
        toColumn: overContainer,
        timestamp,
        columns: currentState,
        restore,
      });

    } else {
      console.log('Moving between different columns.');

      if (!isMovementAllowed(activeContainer, overContainer)) {
        console.log('Movement between columns is not allowed.');
        return;
      }

      const activeIndex = columns[activeContainer].findIndex(item => item.id === active.id);
      const movedItem = columns[activeContainer][activeIndex];
      
      const newActiveItems = columns[activeContainer].filter(item => item.id !== active.id);
      const newOverItems = [...columns[overContainer], movedItem];
      
      const newColumns = {
        ...columns,
        [activeContainer]: newActiveItems,
        [overContainer]: newOverItems,
      };

      setColumns(newColumns);
      
      const timestamp = new Date().toLocaleTimeString();
      const user = 'admin@polly.com';
      const logMessage = `[${timestamp}] ${user} moved Palette ${movedItem.paletteIndex} from ${activeContainer} to ${overContainer}`;
      addAuditLog(logMessage);

      const restore = () => setColumns(currentState);
      onMovement({
        item: movedItem,
        fromColumn: activeContainer,
        toColumn: overContainer,
        timestamp,
        columns: currentState,
        restore,
      });
    }
  };

  const findContainer = (id: string) => {
    return Object.keys(columns).find(key => 
      columns[key].some(item => item.id === id)
    );
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
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
    </div>
  );
};

export default KanbanBoard;
