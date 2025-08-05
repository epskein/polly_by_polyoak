"use client"

// src/pages/inventory-tracker/index.tsx
import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "react-beautiful-dnd"
import ProductList from "../../components/inventory-tracker/ProductList"
import KanbanBoard from "../../components/inventory-tracker/KanbanBoard"
import AuditTrail from "../../components/inventory-tracker/AuditTrail"
import { AddProductDialog } from "../../components/inventory-tracker/AddProductDialog"
import EditProductDialog from "../../components/inventory-tracker/EditProductDialog"
import UndoButton from "../../components/inventory-tracker/UndoButton"
import ErrorBoundary from "../../components/inventory-tracker/ErrorBoundary"
import type { Product, Column, Pallet, AuditLog } from "../../types/inventory"
import { useAuthContext } from "../../context/AuthContext"
import { 
    getProducts, 
    getPallets, 
    getAuditLogs, 
    updatePalletStatus, 
    createAuditLog,
    addPallet,
    deletePallet 
} from "./lib/actions"
import { supabase } from "../../lib/supabase"


export default function InventoryTracker() {
  // State variables
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("viewer")
  const [loading, setLoading] = useState<boolean>(true)
  const [products, setProducts] = useState<Product[]>([])
  const [pallets, setPallets] = useState<Pallet[]>([])
  const [columns, setColumns] = useState<Column[]>([
    { id: "prominent", title: "SOH PROMINENT", productIds: [] },
    { id: "to-replenish", title: "TO REPLENISH", productIds: [] },
    { id: "in-transit", title: "IN TRANSIT TO PROMINENT", productIds: [] },
  ]);
  const [auditTrail, setAuditTrail] = useState<AuditLog[]>([])
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [lastMove, setLastMove] = useState<AuditLog | null>(null)
  const [undoKey, setUndoKey] = useState<number>(0)
  
  const auth = useAuthContext()

  // Define allowed moves based on user roles
  const allowedMoves: Record<string, Record<string, string[]>> = {
    admin: {
      prominent: ["to-replenish", "in-transit"],
      "to-replenish": ["prominent", "in-transit"],
      "in-transit": ["prominent", "to-replenish"],
    },
    manager: {
      prominent: ["to-replenish", "in-transit"],
      "to-replenish": ["prominent", "in-transit"],
      "in-transit": ["prominent", "to-replenish"],
    },
    warehouse: {
      prominent: ["to-replenish"],
      "to-replenish": [],
      "in-transit": [],
    },
    logistics: {
      "to-replenish": ["in-transit"],
      prominent: [],
      "in-transit": [],
    },
    receiving: {
      "in-transit": ["prominent"],
      prominent: [],
      "to-replenish": [],
    },
    viewer: {
      prominent: [],
      "to-replenish": [],
      "in-transit": [],
    },
  }

  // Check for authenticated user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (auth.user) {
          setUserName(auth.user.email || "Authenticated User")
          if (auth.profile) {
            setUserRole(auth.profile.position || "viewer")
          } else {
            setUserRole("warehouse")
          }
        } else {
          setUserName("Demo User")
          setUserRole("warehouse")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUserName("Demo User")
        setUserRole("viewer")
      }
    }
    checkAuth()
  }, [auth])

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedProducts, fetchedPallets, fetchedAuditLogs] = await Promise.all([
        getProducts(),
        getPallets(),
        getAuditLogs(),
      ]);
      
      setProducts(fetchedProducts);
      setPallets(fetchedPallets);
      setAuditTrail(fetchedAuditLogs.map(log => ({...log, details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details })));

      const newColumns = columns.map(col => ({
          ...col,
          productIds: fetchedPallets.filter(p => p.status === col.id).map(p => p.id)
      }));
      setColumns(newColumns);

    } catch (error) {
      console.error("Failed to load board data:", error);
    } finally {
      setLoading(false);
    }
  }, [columns]);

  // Load initial data from backend
  useEffect(() => {
    loadData();
  }, [loadData]);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId: palletId } = result;

      if (!destination) return;

      const sourceColumn = columns.find((col) => col.id === source.droppableId);
      const destColumn = columns.find((col) => col.id === destination.droppableId);

      if (!sourceColumn || !destColumn || sourceColumn.id === destColumn.id) {
        return;
      }
      
      const originalPallets = pallets;
      const updatedPallets = pallets.map(p => p.id === palletId ? { ...p, status: destColumn.id } : p);
      setPallets(updatedPallets);
      
      const newSourceProductIds = sourceColumn.productIds.filter(id => id !== palletId);
      const newDestProductIds = [...destColumn.productIds];
      newDestProductIds.splice(destination.index, 0, palletId);

      const newColumns = columns.map(col => {
          if (col.id === source.droppableId) return { ...col, productIds: newSourceProductIds };
          if (col.id === destination.droppableId) return { ...col, productIds: newDestProductIds };
          return col;
      });
      setColumns(newColumns);

      try {
        await updatePalletStatus(palletId, destColumn.id);

        const pallet = pallets.find(p => p.id === palletId);
        const product = products.find(p => p.id === pallet?.product_id);
        
        if (pallet && product) {
          const newLog = await createAuditLog({
            action_type: 'PALLET_MOVE',
            product_id: product.id,
            pallet_id: pallet.id,
            details: {
              productName: product.name,
              from: sourceColumn.title,
              to: destColumn.title
            },
          });
          if (newLog) {
            setAuditTrail(prev => [newLog, ...prev]);
            setLastMove(newLog);
            setUndoKey(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error("Failed to update pallet status:", error);
        setPallets(originalPallets);
        setColumns(columns);
      }
    },
    [columns, pallets, products]
  );
  
  const handleAddProduct = async (newProductData: Omit<Product, "id">) => {
    const { data: newProduct, error } = await supabase
        .from('products')
        .insert([newProductData])
        .select()
        .single();

    if (error) {
        console.error("Error adding product:", error);
        return;
    }

    if (newProduct) {
        const newPallets = [];
        for (let i = 0; i < newProduct.palettes; i++) {
            const pallet = await addPallet(newProduct.id, "prominent");
            if(pallet) newPallets.push(pallet);
        }
        await createAuditLog({
            action_type: 'NEW_PRODUCT',
            product_id: newProduct.id,
            details: { name: newProduct.name, palettes: newProduct.palettes }
        });
        await loadData();
    }
  };

  const handleUpdateProduct = async (updatedProductFields: Partial<Product> & { id: string }) => {
    const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updatedProductFields)
        .eq('id', updatedProductFields.id)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating product:", error);
        return;
    }

    if (updatedProduct) {
        await createAuditLog({
            action_type: 'EDIT_PRODUCT',
            product_id: updatedProduct.id,
            details: { changes: updatedProductFields }
        });
        await loadData();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    
    // First, delete all pallets associated with the product
    const productPallets = pallets.filter(p => p.product_id === productId);
    await Promise.all(productPallets.map(p => deletePallet(p.id)));

    // Then, delete the product itself
    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if (error) {
        console.error("Error deleting product:", error);
        return;
    }

    await createAuditLog({
        action_type: 'DELETE_PRODUCT',
        product_id: productId,
        details: { name: productToDelete.name }
    });
    await loadData();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditProductDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Inventory Kanban Board</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <ProductList
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={handleEditProduct}
              />
              <KanbanBoard
                columns={columns}
                products={products}
                pallets={pallets}
                userRole={userRole}
              />
            </div>
            <div className="md:col-span-1">
              <AuditTrail auditTrail={auditTrail} products={products} />
            </div>
          </div>
        </DragDropContext>

        <EditProductDialog
          isOpen={isEditProductDialogOpen}
          onClose={() => setIsEditProductDialogOpen(false)}
          product={selectedProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
        {/* Undo logic would need to be re-evaluated with the new async nature */}
      </div>
    </ErrorBoundary>
  )
}
