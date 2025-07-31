// src/pages/ProminentInventory/index.tsx
import React, { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import AuditTrail from './components/AuditTrail';
import KanbanBoard from './components/KanbanBoard';
import ProductList from './components/ProductList';
import { Product, AuditLog } from './types';

const initialProducts: Product[] = [
    { id: '1', description: 'Roofkote', supplierCode: 'SUP001', stockCode: 'RC01', itemsPerPalette: 25, palettes: 1, color: '#ef4444' },
    { id: '2', description: 'PVA', supplierCode: 'SUP002', stockCode: 'PV01', itemsPerPalette: 25, palettes: 1, color: '#22c55e' },
];

function ProminentInventory() {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [auditLog, setAuditLog] = useState<AuditLog[]>([]);

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

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        );
        addAuditLog(`Updated product: ${updatedProduct.description}`);
    };

    const handleDeleteProduct = (productId: string) => {
        const productToDelete = products.find((p) => p.id === productId);
        if (productToDelete) {
            setProducts((prev) => prev.filter((product) => product.id !== productId));
            addAuditLog(`Deleted product: ${productToDelete.description}`);
        }
    };

    return (
        <>
            <PageMeta
                title="Prominent Inventory | Polly"
                description="Prominent Inventory Kanban board for tracking stock."
            />
            <div className="px-4 md:px-6 2xl:px-10">
                <PageBreadcrumb pageTitle="Prominent Inventory" />
                <div className="mt-6">
                    <ProductList
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        products={products}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <KanbanBoard products={products} setProducts={setProducts} addAuditLog={addAuditLog} />
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
