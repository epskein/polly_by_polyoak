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
import type { Product, Column, AuditEntry } from "../../types/inventory"
import { useAuthContext } from "../../context/AuthContext"
import { Button } from "../../components/ui/button/Button"
import { FaPlus } from "react-icons/fa"

export default function InventoryTracker() {
  // State variables with proper typing
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("viewer") // Default role
  const [loading, setLoading] = useState<boolean>(true)
  const [boardData, setBoardData] = useState<{ products: Product[]; columns: Column[] }>({ products: [], columns: [] });
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([])
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [lastMove, setLastMove] = useState<AuditEntry | null>(null)
  const [undoKey, setUndoKey] = useState<number>(0)
  const [forceRerender, setForceRerender] = useState<number>(0)

  // Get auth context
  const auth = useAuthContext()

  // Define allowed moves based on user roles
  const allowedMoves: Record<string, Record<string, string[]>> = {
    admin: {
      // Admins can move items between any columns
      prominent: ["to-replenish", "in-transit"],
      "to-replenish": ["prominent", "in-transit"],
      "in-transit": ["prominent", "to-replenish"],
    },
    manager: {
      // Managers can move items between any columns
      prominent: ["to-replenish", "in-transit"],
      "to-replenish": ["prominent", "in-transit"],
      "in-transit": ["prominent", "to-replenish"],
    },
    warehouse: {
      // Warehouse staff can only move from SOH to TO REPLENISH
      prominent: ["to-replenish"],
      "to-replenish": [],
      "in-transit": [],
    },
    logistics: {
      // Logistics staff can only move from TO REPLENISH to IN TRANSIT
      prominent: [],
      "to-replenish": ["in-transit"],
      "in-transit": [],
    },
    receiving: {
      // Receiving staff can only move from IN TRANSIT to SOH
      prominent: [],
      "to-replenish": [],
      "in-transit": ["prominent"],
    },
    viewer: {
      // Viewers cannot move items
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
            setUserRole(auth.profile.position || "viewer") // Use position as role
          } else {
            setUserRole("warehouse")
          }
        } else {
          const storedUserName = localStorage.getItem("userName")
          const storedUserRole = localStorage.getItem("userRole")
          if (storedUserName) {
            setUserName(storedUserName)
          } else {
            setUserName("Demo User")
            localStorage.setItem("userName", "Demo User")
          }
          if (storedUserRole) {
            setUserRole(storedUserRole)
          } else {
            setUserRole("warehouse")
            localStorage.setItem("userRole", "warehouse")
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUserName("Demo User")
        setUserRole("viewer")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [auth])

  // Load initial data
  useEffect(() => {
    if (loading) return

    const initialProducts = [
      { id: "XL12", name: "Roofkote", color: "#FF0000", supplierCode: "SUP001", stockCode: "RC01", itemsPerPalette: 25, palettes: 4 },
      { id: "PVA001", name: "PVA", color: "#00FF00", supplierCode: "SUP002", stockCode: "PV01", itemsPerPalette: 25, palettes: 3 },
      { id: "EN22", name: "Enamel", color: "#0000FF", supplierCode: "SUP003", stockCode: "EN01", itemsPerPalette: 25, palettes: 6 },
    ];

    const initialColumns = [
      {
        id: "prominent",
        title: "SOH PROMINENT",
        productIds: [
          "XL12-1", "XL12-2", "XL12-3", "XL12-4",
          "PVA001-1", "PVA001-2", "PVA001-3",
          "EN22-1", "EN22-2", "EN22-3", "EN22-4", "EN22-5", "EN22-6",
        ],
      },
      { id: "to-replenish", title: "TO REPLENISH", productIds: [] },
      { id: "in-transit", title: "IN TRANSIT TO PROMINENT", productIds: [] },
    ];
    
    setBoardData({ products: initialProducts, columns: initialColumns });
  }, [loading])

  // Generate color function with return type
  const generateColor = (): string => {
    const hue = Math.floor(Math.random() * 360)
    return `hsl(${hue}, 100%, 50%)`
  }

  // Add audit entry function with proper typing
  const addAuditEntry = useCallback(
    (entry: Omit<AuditEntry, "id" | "timestamp" | "userName">) => {
      const newAuditEntry: AuditEntry = {
        id: Date.now().toString(),
        userName: userName || "Unknown User",
        timestamp: new Date(),
        ...entry,
      }

      setAuditTrail((prevAuditTrail) => [newAuditEntry, ...prevAuditTrail])

      if (entry.action === "move") {
        setLastMove(newAuditEntry)
        setUndoKey((prev) => prev + 1)
      }

      return newAuditEntry
    },
    [userName],
  )

  // Handle drag end with proper typing
  const onDragEnd = useCallback(
    (result: DropResult) => {
      try {
        const { destination, source, draggableId } = result

        if (!destination) return
        
        setBoardData(currentBoardData => {
          const { products, columns } = currentBoardData;
          const sourceColumn = columns.find((col) => col.id === source.droppableId)
          const destColumn = columns.find((col) => col.id === destination.droppableId)

          if (!sourceColumn || !destColumn) return currentBoardData

          // Check if the move is allowed based on user role
          if (
            !allowedMoves[userRole] ||
            !allowedMoves[userRole][sourceColumn.id] ||
            !allowedMoves[userRole][sourceColumn.id].includes(destColumn.id)
          ) {
            console.log(
              `User with role ${userRole} is not allowed to move items from ${sourceColumn.title} to ${destColumn.title}`,
            )
            return currentBoardData
          }

          const newSourceProductIds = Array.from(sourceColumn.productIds)
          const [movedItemId] = newSourceProductIds.splice(source.index, 1)

          const newDestProductIds = Array.from(destColumn.productIds)
          newDestProductIds.splice(destination.index, 0, movedItemId)

          const newColumns = columns.map((col) => {
            if (col.id === sourceColumn.id) {
              return { ...col, productIds: newSourceProductIds }
            }
            if (col.id === destColumn.id) {
              return { ...col, productIds: newDestProductIds }
            }
            return col
          })

          // Add entry to audit trail
          const [productId, paletteNumber] = movedItemId.split("-")
          const product = products.find((p) => p.id === productId)

          if (product) {
            addAuditEntry({
              productId,
              productName: product.name,
              productCode: `${product.supplierCode} / ${product.stockCode}`,
              productColor: product.color,
              paletteNumber: Number.parseInt(paletteNumber),
              fromColumn: sourceColumn.title,
              toColumn: destColumn.title,
              action: "move",
              details: `Moved from ${sourceColumn.title} to ${destColumn.title}`,
            })
          }
          
          return { ...currentBoardData, columns: newColumns };
        });
      } catch (error) {
        console.error("Error in onDragEnd:", error)
      }
    },
    [userRole, allowedMoves, addAuditEntry],
  )

  // Add product function with proper typing
  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const productToAdd: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      color: newProduct.color || generateColor(),
      itemsPerPalette: newProduct.itemsPerPalette || 25,
      palettes: Number(newProduct.palettes) || 0,
      supplierCode: newProduct.supplierCode || `SUP-${Date.now()}`,
      stockCode: newProduct.stockCode || `SC-${Date.now()}`,
    }

    setBoardData(({ products, columns }) => {
      const newProducts = [...products, productToAdd];
      
      const newColumns = columns.map(column => {
        if (column.id === 'prominent') {
          const newProductIds = Array.from(
            { length: productToAdd.palettes },
            (_, i) => `${productToAdd.id}-${i + 1}`
          );
          return { ...column, productIds: [...column.productIds, ...newProductIds] };
        }
        return column;
      });

      return { products: newProducts, columns: newColumns };
    });

    addAuditEntry({
      productId: productToAdd.id,
      productName: productToAdd.name,
      productCode: `${productToAdd.supplierCode} / ${productToAdd.stockCode}`,
      productColor: productToAdd.color,
      action: "add",
      details: `Added new product: ${productToAdd.name}`,
    })
  }

  // Update product function with proper typing
  const handleUpdateProduct = (
    updatedProductFields: Partial<Product> & { id: string },
    action?: "items-per-palette-change" | "palettes-change",
    change?: number,
  ) => {
    setBoardData(({ products, columns }) => {
      const oldProduct = products.find((p) => p.id === updatedProductFields.id);
      if (!oldProduct) {
        return { products, columns };
      }

      const updatedProduct = { ...oldProduct, ...updatedProductFields };
      const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      
      let newColumns = columns;
      const paletteDiff = updatedProduct.palettes - oldProduct.palettes;

      if (paletteDiff !== 0) {
        newColumns = columns.map((c) => ({ ...c, productIds: [...c.productIds] }));
        const prominentColumn = newColumns.find((c) => c.id === "prominent") || newColumns[0];

        if (paletteDiff > 0) {
          for (let i = 0; i < paletteDiff; i++) {
            prominentColumn.productIds.push(`${updatedProduct.id}-${oldProduct.palettes + i + 1}`);
          }
        } else {
          const palettesToRemove = Math.abs(paletteDiff);
          const productIdsToRemove = new Set<string>();
          for (let i = 0; i < palettesToRemove; i++) {
            productIdsToRemove.add(`${updatedProduct.id}-${oldProduct.palettes - i}`);
          }
          newColumns.forEach((column) => {
            column.productIds = column.productIds.filter((id) => !productIdsToRemove.has(id));
          });
        }
      }

      if (action && change) {
        addAuditEntry({
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          productCode: `${updatedProduct.supplierCode} / ${updatedProduct.stockCode}`,
          productColor: updatedProduct.color,
          action: 'update',
          details: `Updated ${action} by ${change}`
        });
      }

      return { products: newProducts, columns: newColumns };
    });
  }

  // Edit product details function with proper typing
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditProductDialogOpen(true)
  }

  // Handle undo function with proper typing
  const handleUndo = useCallback(() => {
    try {
      if (!lastMove) return

      const productExists = boardData.products.some((p) => p.id === lastMove.productId)

      if (!productExists) {
        setLastMove(null)
        return
      }

      // Check if the undo operation is allowed based on user role
      const sourceColumn = boardData.columns.find((col) => col.title === lastMove.toColumn)
      const destColumn = boardData.columns.find((col) => col.title === lastMove.fromColumn)

      if (!sourceColumn || !destColumn) {
        setLastMove(null)
        return
      }

      if (
        !allowedMoves[userRole] ||
        !allowedMoves[userRole][sourceColumn.id] ||
        !allowedMoves[userRole][sourceColumn.id].includes(destColumn.id)
      ) {
        alert(`You don't have permission to undo this move as a ${userRole}.`)
        return
      }

      setBoardData(currentBoardData => {
        const { products, columns } = currentBoardData;
        const sourceColumn = columns.find((col) => col.title === lastMove.toColumn)
        const destColumn = columns.find((col) => col.title === lastMove.fromColumn)

        if (!sourceColumn || !destColumn) return currentBoardData

        const movedItemId = `${lastMove.productId}-${lastMove.paletteNumber}`

        const newSourceProductIds = sourceColumn.productIds.filter((id) => id !== movedItemId)
        const newDestProductIds = [...destColumn.productIds, movedItemId]

        const newColumns = columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, productIds: newSourceProductIds }
          }
          if (col.id === destColumn.id) {
            return { ...col, productIds: newDestProductIds }
          }
          return col
        })

        addAuditEntry({
          productId: lastMove.productId,
          productName: lastMove.productName,
          productCode: lastMove.productCode,
          productColor: lastMove.productColor,
          paletteNumber: lastMove.paletteNumber,
          fromColumn: lastMove.toColumn,
          toColumn: lastMove.fromColumn,
          action: "undo-move",
          details: `Undid move from ${lastMove.fromColumn} to ${lastMove.toColumn}`,
        })

        return { ...currentBoardData, columns: newColumns };
      });

      setAuditTrail((prevAuditTrail) => prevAuditTrail.filter((entry) => entry.id !== lastMove.id))
      setLastMove(null)
    } catch (error) {
      console.error("Error in handleUndo:", error)
      setLastMove(null)
    }
  }, [lastMove, addAuditEntry, boardData.products, boardData.columns, userRole, allowedMoves])

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = boardData.products.find((p) => p.id === productId)
    if (!productToDelete) return

    setBoardData(({ products, columns }) => {
      const newProducts = products.filter((p) => p.id !== productId);
      const newColumns = columns.map((col) => ({
        ...col,
        productIds: col.productIds.filter((id) => !id.startsWith(productId)),
      }));
      return { products: newProducts, columns: newColumns };
    });

    addAuditEntry({
      productId: productToDelete.id,
      productName: productToDelete.name,
      productCode: `${productToDelete.supplierCode} / ${productToDelete.stockCode}`,
      productColor: productToDelete.color,
      action: "delete",
      details: `Deleted product: ${productToDelete.name}`,
    })
  }

  // If still loading, show a loading indicator
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
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Inventory Kanban Board</h1>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <ProductList
                    products={boardData.products}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                  <KanbanBoard
                    columns={boardData.columns}
                    products={boardData.products}
                    userRole={userRole}
                  />
                </div>
                <div className="md:col-span-1">
                  <AuditTrail auditTrail={auditTrail} products={boardData.products} />
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
            {lastMove && <UndoButton onUndo={handleUndo} key={`undo-${undoKey}`} />}
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}
