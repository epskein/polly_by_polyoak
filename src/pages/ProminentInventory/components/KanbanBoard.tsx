// src/pages/ProminentInventory/components/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
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

const KanbanBoard: React.FC<KanbanBoardProps> = ({ products, setProducts, addAuditLog }) => {
  const [columns, setColumns] = useState<{ [key: string]: KanbanProduct[] }>({
    'SOH PROMINENT': [],
    'TO REPLENISH': [],
    'IN TRANSIT TO PROMINENT': [],
  });

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeContainer = findContainer(active.id as string);
      const overContainer = findContainer(over.id as string) ?? over.id as string;

      if (activeContainer && overContainer) {
        const activeItem = findItemInColumns(active.id as string);
        if (!activeItem) return;

        if (activeContainer === overContainer) {
          setColumns(prev => {
            const columnItems = Array.from(prev[activeContainer]);
            const activeIndex = columnItems.findIndex(item => item.id === active.id);
            const overIndex = columnItems.findIndex(item => item.id === over.id);
            const [movedItem] = columnItems.splice(activeIndex, 1);
            columnItems.splice(overIndex, 0, movedItem);
            return { ...prev, [activeContainer]: columnItems };
          });
        } else {
          setColumns(prev => {
            const activeItems = Array.from(prev[activeContainer]);
            const overItems = Array.from(prev[overContainer]);
            const activeIndex = activeItems.findIndex(item => item.id === active.id);
            const [movedItem] = activeItems.splice(activeIndex, 1);
            const newOverItems = [...overItems, movedItem];
            addAuditLog(`Moved ${movedItem.description} (Palette ${movedItem.paletteIndex}) from ${activeContainer} to ${overContainer}`);
            return {
              ...prev,
              [activeContainer]: activeItems,
              [overContainer]: newOverItems,
            };
          });
        }
      }
    }
  };

  const findContainer = (id: string) => {
    return Object.keys(columns).find((key) => columns[key].some((item) => item.id === id));
  };

  const findItemInColumns = (id: string): KanbanProduct | undefined => {
    for (const column of Object.values(columns)) {
      const item = column.find(item => item.id === id);
      if (item) return item;
    }
    return undefined;
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-6">
        {Object.keys(columns).map((key) => (
          <KanbanColumn key={key} id={key} title={key} products={columns[key]} />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
