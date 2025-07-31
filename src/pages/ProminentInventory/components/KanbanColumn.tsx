// src/pages/ProminentInventory/components/KanbanColumn.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Product } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  products: Product[];
}

const ALLOWED_MOVEMENTS = {
  'SOH PROMINENT': ['TO REPLENISH'],
  'TO REPLENISH': ['IN TRANSIT TO PROMINENT'],
  'IN TRANSIT TO PROMINENT': ['SOH PROMINENT'],
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, products }) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
  });

  const isValidDropTarget = () => {
    if (!active) return true;

    // Find the source container by checking the active draggable's data
    const activeData = active.data.current;
    if (!activeData) return true;

    const sourceContainer = activeData.sortable?.containerId;
    if (!sourceContainer) return true;

    const allowedDestinations = ALLOWED_MOVEMENTS[sourceContainer as keyof typeof ALLOWED_MOVEMENTS];
    return allowedDestinations?.includes(id) || sourceContainer === id;
  };

  const isValid = isValidDropTarget();

  return (
    <div 
      data-column={id}
      className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg transition-colors duration-200 ${
        isOver && isValid ? 'bg-green-50 dark:bg-green-900/20' : ''
      } ${
        isOver && !isValid ? 'bg-red-50 dark:bg-red-900/20' : ''
      }`}
    >
      <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
      <SortableContext 
        items={products} 
        strategy={verticalListSortingStrategy}
        id={id}
      >
        <div ref={setNodeRef} className="min-h-[200px]">
          {products.map((product) => (
            <KanbanCard key={product.id} product={product} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
