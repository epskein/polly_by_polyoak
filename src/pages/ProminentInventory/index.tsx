// src/pages/ProminentInventory/index.tsx
import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import AuditTrail from './components/AuditTrail';
import KanbanBoard from './components/KanbanBoard';
import ProductList from './components/ProductList';
import UndoButton from './components/UndoButton';
import { Product, AuditLog, KanbanProduct } from './types';
import { getProducts, addProduct, updateProduct, deleteProduct } from './lib/actions';

interface Movement {
  item: KanbanProduct;
  fromColumn: string;
  toColumn: string;
  timestamp: string;
  columns: { [key: string]: KanbanProduct[] };
  restore: () => void;
}

function ProminentInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
    const [lastMovement, setLastMovement] = useState<Movement | null>(null);
    const [showUndo, setShowUndo] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                // Here you could set an error state and display a message to the user
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const addAuditLog = (action: string) => {
        const newLog: AuditLog = {
            id: Date.now().toString(),
            user: 'admin@polly.com',
            action,
            timestamp: new Date().toISOString(),
        };
        setAuditLog((prev) => [newLog, ...prev]);
    };

    const handleAddProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
        try {
            const newProduct = await addProduct(productData);
            if (newProduct) {
                setProducts((prev) => [newProduct, ...prev]);
                addAuditLog(`Created product: ${newProduct.description}`);
            }
        } catch (error) {
            console.error("Failed to add product:", error);
        }
    };

    const handleUpdateProduct = async (productData: Product) => {
        try {
            const updatedProd = await updateProduct(productData);
            if (updatedProd) {
                setProducts((prev) => 
                    prev.map((p) => p.id === updatedProd.id ? updatedProd : p)
                );
                addAuditLog(`Updated product: ${updatedProd.description}`);
            }
        } catch (error) {
            console.error("Failed to update product:", error);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        const productToDelete = products.find(p => p.id === productId);
        if (!productToDelete) return;

        try {
            await deleteProduct(productId);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
            addAuditLog(`Deleted product: ${productToDelete.description}`);
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    const handleMovement = (movement: Movement) => {
        setLastMovement(movement);
        setShowUndo(true);
    };

    const handleUndo = () => {
        if (!lastMovement) return;
        lastMovement.restore();
        const timestamp = new Date().toLocaleTimeString();
        const user = 'admin@polly.com';
        addAuditLog(
            `[${timestamp}] ${user} undid movement of Palette ${lastMovement.item.paletteIndex} of ${lastMovement.item.description}`
        );
        setShowUndo(false);
        setLastMovement(null);
    };

    const handleUndoTimeout = () => {
        setShowUndo(false);
        setLastMovement(null);
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or a more sophisticated loading spinner
    }

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