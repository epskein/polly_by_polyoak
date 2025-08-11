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
import type { Pallet } from '../../../types/inventory';
import { updatePalletStatus, createAuditLog } from '../lib/actions';
import { supabase } from '../../../lib/supabase';

interface KanbanBoardProps {
  products: Product[]
  pallets: Pallet[]
  setPallets: React.Dispatch<React.SetStateAction<Pallet[]>>
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  addAuditLog: (action: string) => void
  onMovement: (movement: {
    item: KanbanProduct
    fromColumn: string
    toColumn: string
    timestamp: string
    columns: { [key: string]: KanbanProduct[] }
    restore: () => void
  }) => void
}

interface KanbanProduct extends Product {
  // Index of this pallet among all pallets of the same product (1-based)
  paletteIndex: number
  // The persisted pallet id
  id: string
  // The originating product id
  productId: string
}

const ALLOWED_MOVEMENTS = {
  'SOH PROMINENT': ['TO REPLENISH'],
  'TO REPLENISH': ['IN TRANSIT TO PROMINENT'],
  'IN TRANSIT TO PROMINENT': ['SOH PROMINENT'],
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ products, pallets, setPallets: _setPallets, setProducts: _setProducts, addAuditLog, onMovement }) => {
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
    // Build a map of productId -> product for quick lookup
    const productById = new Map(products.map(p => [p.id, p]))

    // For paletteIndex, group pallets by product and sort by created_at
    const palletsByProduct = new Map<string, Pallet[]>()
    pallets.forEach(p => {
      const arr = palletsByProduct.get(p.product_id) || []
      arr.push(p)
      palletsByProduct.set(p.product_id, arr)
    })
    palletsByProduct.forEach(arr => arr.sort((a, b) => a.created_at.localeCompare(b.created_at)))

    // Helper to compute index within product group
    const computeIndex = (pallet: Pallet): number => {
      const arr = palletsByProduct.get(pallet.product_id) || []
      const idx = arr.findIndex(x => x.id === pallet.id)
      return idx >= 0 ? idx + 1 : 1
    }

    // Build columns from pallet statuses
    const nextColumns: { [key: string]: KanbanProduct[] } = {
      'SOH PROMINENT': [],
      'TO REPLENISH': [],
      'IN TRANSIT TO PROMINENT': [],
    }

    pallets.forEach((pallet: Pallet) => {
      const product = productById.get(pallet.product_id)
      if (!product) return
      const item: KanbanProduct = {
        ...product,
        id: pallet.id,
        paletteIndex: computeIndex(pallet),
        productId: product.id,
      }
      const col = pallet.status as keyof typeof nextColumns
      if (!nextColumns[col]) nextColumns['SOH PROMINENT'].push(item)
      else nextColumns[col].push(item)
    })

    setColumns(nextColumns)
  }, [products, pallets])

  const isMovementAllowed = (from: string, to: string): boolean => {
    const allowedDestinations = ALLOWED_MOVEMENTS[from as keyof typeof ALLOWED_MOVEMENTS];
    return allowedDestinations?.includes(to) || false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeContainer = findContainer(active.id as string);
    if (!activeContainer) return;
  };

  const handleDragOver = (_event: DragOverEvent) => {
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
      const reorderedItem = currentState[activeContainer][activeIndex]
      const logMessage = `[${timestamp}] ${user} reordered (Product ${reorderedItem.description}), Palette ${reorderedItem.paletteIndex} in ${activeContainer}`;
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
      const logMessage = `[${timestamp}] ${user} moved (Product ${movedItem.description}), Palette ${movedItem.paletteIndex} from ${activeContainer} to ${overContainer}`;
      addAuditLog(logMessage);

      const previousStatus = activeContainer
      const nextStatus = overContainer

      // Persist status change in backend; revert on failure
      const persist = async () => {
        try {
          await updatePalletStatus(movedItem.id, nextStatus)
          // Persist audit entry
          const { data: { session } } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (!userId) console.warn('[ProminentInventory] No authenticated user; audit log insert may be blocked by RLS')

          const logPayload = {
            action_type: 'PALLET_MOVE',
            product_id: movedItem.productId,
            pallet_id: movedItem.id,
            details: {
              from: previousStatus,
              to: nextStatus,
              paletteIndex: movedItem.paletteIndex,
              productDescription: movedItem.description,
            },
            user_id: userId,
          } as const

          console.log('[ProminentInventory] Creating audit log:', logPayload)
          await createAuditLog(logPayload as any)
          console.log('[ProminentInventory] Audit log created successfully')
          // Reflect in parent pallets state for consistency
          // We do not reorder on backend; only status changes are persisted
        } catch (e) {
          console.error('Failed to persist pallet move. Reverting UI...', e)
          setColumns(currentState)
        }
      }
      void persist()

      const restore = () => {
        setColumns(currentState)
        // Best-effort backend rollback
        void updatePalletStatus(movedItem.id, previousStatus)
      }

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
