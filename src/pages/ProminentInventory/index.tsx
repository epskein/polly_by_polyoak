// src/pages/ProminentInventory/index.tsx
import React, { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import AuditTrail from './components/AuditTrail';
import KanbanBoard from './components/KanbanBoard';
import ProductList from './components/ProductList';
import UndoButton from './components/UndoButton';
import { Product, AuditLog } from './types';

interface KanbanProduct extends Product {
  paletteIndex: number;
}

interface Movement {
  item: KanbanProduct;
  fromColumn: string;
  toColumn: string;
  timestamp: string;
  columns: { [key: string]: KanbanProduct[] };
  restore: () => void;
}

function ProminentInventory() {
    console.log('ProminentInventory rendering');
    const [products, setProducts] = useState<Product[]>([
        { 
            id: '1', 
            description: 'Roofkote', 
            supplierCode: 'SUP001', 
            stockCode: 'RC01', 
            itemsPerPalette: 25, 
            palettes: 1, 
            color: '#ef4444' 
        },
        { 
            id: '2', 
            description: 'PVA', 
            supplierCode: 'SUP002', 
            stockCode: 'PV01', 
            itemsPerPalette: 25, 
            palettes: 1, 
            color: '#22c55e' 
        },
    ]);
    const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
    const [lastMovement, setLastMovement] = useState<Movement | null>(null);
    const [showUndo, setShowUndo] = useState(false);

    const addAuditLog = (action: string) => {
        const newLog: AuditLog = {
            id: Date.now().toString(),
            user: 'admin@polly.com', // This would ideally come from an auth context
            action,
            timestamp: new Date().toISOString(),
        };
        setAuditLog((prev) => [newLog, ...prev]);
    };

    const handleAddProduct = (product: Omit<Product, 'id'>) => {
        const newProduct = { ...product, id: Date.now().toString() };
        setProducts((prev) => [...prev, newProduct]);
        addAuditLog(`Created product: ${newProduct.description} with ${newProduct.palettes} palettes`);
    };

    const handleMovement = (movement: Movement) => {
        console.log('Movement received:', movement);
        
        // Immediately update state to show the undo button
        setLastMovement(movement);
        setShowUndo(true);
        
        console.log('States updated:', {
            movement,
            showUndo: true,
        });
    };

    const handleUndo = () => {
        if (!lastMovement) {
            console.log('No movement to undo');
            return;
        }

        console.log('Undoing movement:', lastMovement);

        // Restore the previous state
        lastMovement.restore();

        // Log the undo action
        const timestamp = new Date().toLocaleTimeString();
        const user = 'admin@polly.com';
        const logMessage = `[${timestamp}] ${user} undid movement of Palette ${lastMovement.item.paletteIndex} of ${lastMovement.item.description} ` +
            `(Stock: ${lastMovement.item.stockCode}) from ${lastMovement.fromColumn} to ${lastMovement.toColumn}`;
        
        console.log('Adding audit log:', logMessage);
        addAuditLog(logMessage);

        // Clear the undo state
        setShowUndo(false);
        setLastMovement(null);
        console.log('Undo state cleared');
    };

    const handleUndoTimeout = () => {
        setShowUndo(false);
        setLastMovement(null);
    };

    console.log('Current state:', { showUndo, lastMovement });
    
    return (
        <>
            <PageMeta
                title="Prominent Inventory | Polly"
                description="Prominent Inventory Kanban board for tracking stock."
            />
            <div className="px-4 md:px-6 2xl:px-10">
                <PageBreadcrumb pageTitle="Prominent Inventory" />
                <div className="mt-6">
                    <div className="space-y-4">
                        <ProductList
                            onAddProduct={handleAddProduct}
                            onUpdateProduct={(updatedProduct) => {
                                setProducts(prev => prev.map(p => 
                                    p.id === updatedProduct.id ? updatedProduct : p
                                ));
                                addAuditLog(`Updated product: ${updatedProduct.description}`);
                            }}
                            onDeleteProduct={(productId) => {
                                const productToDelete = products.find(p => p.id === productId);
                                if (productToDelete) {
                                    setProducts(prev => prev.filter(p => p.id !== productId));
                                    addAuditLog(`Deleted product: ${productToDelete.description}`);
                                }
                            }}
                            products={products}
                        />
                    </div>
                    {showUndo && (
                        <div className="mb-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                            <UndoButton
                                onUndo={handleUndo}
                                onTimeout={handleUndoTimeout}
                                timeoutDuration={30}
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <KanbanBoard
                                products={products}
                                setProducts={setProducts}
                                addAuditLog={addAuditLog}
                                onMovement={handleMovement}
                            />
                        </div>
                        <div>
                            <AuditTrail auditLog={auditLog} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProminentInventory;