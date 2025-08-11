"use client"

// src/pages/inventory-tracker/index.tsx
import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "react-beautiful-dnd"
import ProductList from "../../components/inventory-tracker/ProductList"
import KanbanBoard from "../../components/inventory-tracker/KanbanBoard"
import AuditTrail from "../../components/inventory-tracker/AuditTrail"
import { AddProductDialog } from "../../components/inventory-tracker/AddProductDialog"
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
import { Button } from "../../components/ui/button/Button"
import { FaPlus } from "react-icons/fa"

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
  
  const auth = useAuthContext()

  // Define allowed moves based on user roles
  const allowedMoves: Record<string, Record<string, string[]>> = {
    admin: {
      prominent: ["to-replenish", "in-transit"],
      "to-replenish": ["prominent", "in-transit"],
      "in-transit": ["prominent", "to-replenish"],
    },
    // ... other roles
  }

  // Check for authenticated user
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.user) {
        setUserName(auth.user.email || "Authenticated User")
        setUserRole(auth.profile?.position || "viewer")
      } else {
        setUserName("Demo User")
        setUserRole("viewer")
      }
    }
    checkAuth()
  }, [auth])

  const loadData = useCallback(async () => {
    console.log("HANDLER: `loadData` initiated.");
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

      const initialColumns = [
          { id: "prominent", title: "SOH PROMINENT", productIds: [] },
          { id: "to-replenish", title: "TO REPLENISH", productIds: [] },
          { id: "in-transit", title: "IN TRANSIT TO PROMINENT", productIds: [] },
      ];

      const columnsMap = initialColumns.reduce((acc, column) => {
          acc[column.id] = column;
          return acc;
      }, {} as Record<string, Column>);
      
      fetchedPallets.forEach(pallet => {
          if (columnsMap[pallet.status]) {
              columnsMap[pallet.status].productIds.push(pallet.id);
          }
      });
      
      setColumns(Object.values(columnsMap));
      console.log("HANDLER: `loadData` completed successfully.");

    } catch (error) {
      console.error("HANDLER ERROR: `loadData` failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data from backend
  useEffect(() => {
    loadData();
  }, [loadData]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    // ... drag and drop logic
  }, [columns, pallets, products, loadData]);
  
  const handleAddProduct = async (newProductData: any) => {
    console.log("HANDLER: `handleAddProduct` initiated with data:", newProductData);
    
    const productDataForInsert = {
        name: newProductData.name,
        color: newProductData.color,
        supplierCode: newProductData.supplierCode,
        stockCode: newProductData.stockCode,
        itemsPerPalette: Number(newProductData.itemsPerPalette) || 25,
        palettes: Number(newProductData.palettes) || 0,
    };
    
    console.log("HANDLER: Sanitized product data for insert:", productDataForInsert);

    const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productDataForInsert)
        .select()
        .single();

    if (error) {
        console.error("HANDLER ERROR: Failed to add product to database:", error);
        alert(`Failed to add product: ${error.message}`);
        return;
    }

    console.log("HANDLER: Product created successfully in database:", newProduct);

    if (newProduct) {
        console.log(`HANDLER: Creating ${newProduct.palettes} pallets for new product.`);
        for (let i = 0; i < newProduct.palettes; i++) {
            console.log(`HANDLER: Creating pallet #${i + 1}`);
            await addPallet(newProduct.id, "prominent");
        }
        await createAuditLog({
            action_type: 'NEW_PRODUCT',
            product_id: newProduct.id,
            details: { name: newProduct.name, palettes: newProduct.palettes }
        });
        await loadData();
        console.log("HANDLER: `handleAddProduct` completed successfully.");
    }
  };

  const handleUpdateProduct = async (updatedProductFields: Partial<Product> & { id: string }) => {
    // ... update logic
  };

  const handleDeleteProduct = async (productId: string) => {
    // ... delete logic
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          {/* ... loading spinner ... */}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Inventory Kanban Board</h1>
          <AddProductDialog onAddProduct={handleAddProduct}>
              <Button size="sm">
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Product
              </Button>
          </AddProductDialog>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <ProductList
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
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
      </div>
    </ErrorBoundary>
  )
}
