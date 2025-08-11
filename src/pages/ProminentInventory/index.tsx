// src/pages/ProminentInventory/index.tsx
import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import AuditTrail from './components/AuditTrail';
import KanbanBoard from './components/KanbanBoard';
import ProductList from './components/ProductList';
import UndoButton from './components/UndoButton';
import { Product, AuditLog, KanbanProduct } from './types';
import { getProducts, addProduct, updateProduct, deleteProductAndPallets, createPalletsForProduct, getPallets, getAuditLogs } from './lib/actions';
import type { Pallet } from '../../types/inventory';

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
    const [auditTotal, setAuditTotal] = useState(0)
    const [auditPage, setAuditPage] = useState(1)
    const auditPageSize = 10
    const [pallets, setPallets] = useState<Pallet[]>([]);
    const [lastMovement, setLastMovement] = useState<Movement | null>(null);
    const [showUndo, setShowUndo] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            console.log('[ProminentInventory] Loading products and pallets...')
            try {
                const [fetchedProducts, fetchedPallets, audit] = await Promise.all([
                    getProducts(),
                    getPallets(),
                    getAuditLogs({ limit: auditPageSize, offset: (auditPage - 1) * auditPageSize })
                ])
                setProducts(fetchedProducts)
                setPallets(fetchedPallets)
                setAuditLog(audit.logs.map(l => ({
                    id: l.id,
                    user: composeDisplayName(l.profile) || 'system',
                    action: formatAuditAction(l.action_type, l.details),
                    timestamp: l.created_at
                })))
                setAuditTotal(audit.total)
                console.log(`[ProminentInventory] Loaded ${fetchedProducts.length} products, ${fetchedPallets.length} pallets and ${audit.logs.length} audit logs`)
            } catch (error) {
                console.error('[ProminentInventory] Failed to fetch initial data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAll();
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

    const handleAuditPageChange = async (page: number) => {
        setAuditPage(page)
        try {
            const audit = await getAuditLogs({ limit: auditPageSize, offset: (page - 1) * auditPageSize })
            setAuditLog(audit.logs.map(l => ({
                id: l.id,
                user: composeDisplayName(l.profile) || 'system',
                action: formatAuditAction(l.action_type, l.details),
                timestamp: l.created_at
            })))
            setAuditTotal(audit.total)
        } catch (e) {
            console.error('[ProminentInventory] Failed to fetch audit page:', e)
        }
    }

    function formatAuditAction(actionType: string, details: any): string {
        if (actionType === 'PALLET_MOVE' && details) {
            const from = details.from
            const to = details.to
            const index = details.paletteIndex
            const product = details.productDescription
            return `moved (Product ${product}), Palette ${index} from ${from} to ${to}`
        }
        if (actionType === 'NEW_PRODUCT' && details) {
            return `created product: ${details.name} (palettes: ${details.palettes})`
        }
        return actionType
    }

    function composeDisplayName(profile?: { first_name?: string | null, last_name?: string | null, email?: string | null } | null): string | undefined {
        if (!profile) return undefined
        const first = (profile.first_name || '').trim()
        const last = (profile.last_name || '').trim()
        const full = `${first} ${last}`.trim()
        if (full) return full
        return profile.email || undefined
    }

    const handleAddProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
        console.log('[ProminentInventory] handleAddProduct called with:', productData)
        try {
            const newProduct = await addProduct(productData);
            if (newProduct) {
                setProducts((prev) => [newProduct, ...prev]);
                addAuditLog(`Created product: ${newProduct.description}`);

                // Create pallets in backend for this product
                const count = Number(newProduct.palettes) || 0
                console.log(`[ProminentInventory] Creating ${count} pallets for new product ${newProduct.id}`)
                const created = await createPalletsForProduct(newProduct.id, count, 'SOH PROMINENT')
                console.log(`[ProminentInventory] Pallet creation complete. Created: ${created}`)
                const refreshedPallets = await getPallets()
                setPallets(refreshedPallets)
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
        const productToDelete = products.find(p => p.id === productId)
        if (!productToDelete) return

        const confirmed = window.confirm(`Delete product "${productToDelete.description}" and all associated pallets? This action cannot be undone.`)
        if (!confirmed) return

        try {
            console.log('[ProminentInventory] Requesting soft-delete for product and pallets:', productId)
            await deleteProductAndPallets(productId)
            setProducts(prev => prev.filter(p => p.id !== productId))
            setPallets(prev => prev.filter(pl => pl.product_id !== productId))
            addAuditLog(`Deleted product: ${productToDelete.description}`)
        } catch (error) {
            console.error('Failed to delete product:', error)
            alert(`Failed to delete product: ${(error as Error).message}`)
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
        addAuditLog(`[${timestamp}] ${user} undid movement of Palette ${lastMovement.item.paletteIndex} of ${lastMovement.item.description}`);
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
                <PageBreadcrumb pageTitle="Prominent Inventory" titleClassName="text-3xl md:text-4xl" />
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
                                pallets={pallets}
                                setPallets={setPallets}
                                setProducts={setProducts}
                                addAuditLog={addAuditLog}
                                onMovement={handleMovement}
                            />
                        </div>
                        <div>
                            <AuditTrail auditLog={auditLog} page={auditPage} pageSize={auditPageSize} total={auditTotal} onPageChange={handleAuditPageChange} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProminentInventory;