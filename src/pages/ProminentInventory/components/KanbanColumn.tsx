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

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, products }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
      <SortableContext id={id} items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-4">
          {products.map((product) => (
            <KanbanCard key={product.id} product={product} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
