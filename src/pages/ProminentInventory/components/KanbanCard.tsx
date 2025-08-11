// src/pages/ProminentInventory/components/KanbanCard.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '../types';

interface KanbanProduct extends Product {
  paletteIndex: number;
}

interface KanbanCardProps {
  product: KanbanProduct;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ product }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: product.id,
    data: {
      type: 'card',
      product,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: product.color,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
    >
      <p className="font-semibold text-white">{product.description}</p>
      <p className="text-sm text-gray-200">Supplier: {product.supplier_code}</p>
      <p className="text-sm text-gray-200">Stock: {product.stock_code}</p>
      <p className="text-sm text-gray-200">Palette: {product.paletteIndex} of {product.palettes}</p>
      <p className="text-sm text-gray-200">Items: {product.items_per_palette}</p>
    </div>
  );
};

export default KanbanCard;
