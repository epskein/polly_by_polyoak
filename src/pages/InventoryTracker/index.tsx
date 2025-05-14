"use client"

// src/pages/inventory-tracker/index.tsx
import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "react-beautiful-dnd"
import ProductList from "../../components/inventory-tracker/ProductList"
import KanbanBoard from "../../components/inventory-tracker/KanbanBoard"
import AuditTrail from "../../components/inventory-tracker/AuditTrail"
import AddProductDialog from "../../components/inventory-tracker/AddProductDialog"
import EditProductDialog from "../../components/inventory-tracker/EditProductDialog"
import UndoButton from "../../components/inventory-tracker/UndoButton"
import ErrorBoundary from "../../components/inventory-tracker/ErrorBoundary"
import type { Product, Column, AuditEntry } from "../../types/inventory"
import { useAuthContext } from "../../context/AuthContext"

export default function InventoryTracker() {
  // State variables with proper typing
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("viewer") // Default role
  const [loading, setLoading] = useState<boolean>(true)
  const [products, setProducts] = useState<Product[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([])
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState<boolean>(false)
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
        // Try to get user from auth context
        if (auth.user) {
          setUserName(auth.user.email || "Authenticated User")

          // Get user role from profile or set default
          // This is a placeholder - you'll need to adapt this to your actual user role storage
          if (auth.profile) {
            setUserRole(auth.profile.role || "stdUser")
          } else {
            // For demo purposes, you can set different roles to test functionality
            // In a real app, this would come from your auth system
            setUserRole("warehouse") // Default role for testing
          }
        } else {
          // Fallback to local storage for demo purposes
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
            setUserRole("warehouse") // Default role for testing
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

    setProducts([
      { id: "XL12", name: "Roofkote", color: "#FF0000", stock: 100, code: "XL12", itemsPerPalette: 25, palettes: 4 },
      { id: "PVA001", name: "PVA", color: "#00FF00", stock: 75, code: "PVA001", itemsPerPalette: 25, palettes: 3 },
      { id: "EN22", name: "Enamel", color: "#0000FF", stock: 150, code: "EN22", itemsPerPalette: 25, palettes: 6 },
    ])

    setColumns([
      {
        id: "prominent",
        title: "SOH PROMINENT",
        productIds: [
          "XL12-1",
          "XL12-2",
          "XL12-3",
          "XL12-4",
          "PVA001-1",
          "PVA001-2",
          "PVA001-3",
          "EN22-1",
          "EN22-2",
          "EN22-3",
          "EN22-4",
          "EN22-5",
          "EN22-6",
        ],
      },
      { id: "to-replenish", title: "TO REPLENISH", productIds: [] },
      { id: "in-transit", title: "IN TRANSIT TO PROMINENT", productIds: [] },
    ])
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

        const sourceColumn = columns.find((col) => col.id === source.droppableId)
        const destColumn = columns.find((col) => col.id === destination.droppableId)

        if (!sourceColumn || !destColumn) return

        // Check if the move is allowed based on user role
        if (
          !allowedMoves[userRole] ||
          !allowedMoves[userRole][sourceColumn.id] ||
          !allowedMoves[userRole][sourceColumn.id].includes(destColumn.id)
        ) {
          console.log(
            `User with role ${userRole} is not allowed to move items from ${sourceColumn.title} to ${destColumn.title}`,
          )
          return
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

        setColumns(newColumns)

        // Add entry to audit trail
        const [productId, paletteNumber] = movedItemId.split("-")
        const product = products.find((p) => p.id === productId)

        if (!product) return

        addAuditEntry({
          productId,
          productName: product.name,
          productCode: product.code,
          productColor: product.color,
          paletteNumber: Number.parseInt(paletteNumber),
          fromColumn: sourceColumn.title,
          toColumn: destColumn.title,
          action: "move",
          details: `Moved from ${sourceColumn.title} to ${destColumn.title}`,
        })
      } catch (error) {
        console.error("Error in onDragEnd:", error)
      }
    },
    [columns, products, addAuditEntry, userRole, allowedMoves],
  )

  // Add product function with proper typing
  const addProduct = useCallback(
    (newProduct: Omit<Product, "id" | "color" | "itemsPerPalette" | "palettes">) => {
      try {
        const id = newProduct.code
        const color = generateColor()
        const product: Product = {
          ...newProduct,
          id,
          color,
          itemsPerPalette: 25,
          palettes: Math.ceil(newProduct.stock / 25),
        }

        setProducts((prevProducts) => [...prevProducts, product])

        setColumns((prevColumns) => {
          const prominentColumn = prevColumns.find((col) => col.id === "prominent")
          if (prominentColumn) {
            const newProductIds = Array.from({ length: product.palettes }, (_, i) => `${id}-${i + 1}`)
            return prevColumns.map((col) =>
              col.id === "prominent" ? { ...col, productIds: [...col.productIds, ...newProductIds] } : col,
            )
          }
          return prevColumns
        })

        addAuditEntry({
          productId: id,
          productName: newProduct.name,
          productCode: newProduct.code,
          productColor: color,
          action: "add-product",
          details: `Added new product: ${newProduct.name} (${newProduct.code}) with ${product.palettes} palettes`,
        })
      } catch (error) {
        console.error("Error in addProduct:", error)
      }
    },
    [addAuditEntry],
  )

  // Update product function with proper typing
  const updateProduct = useCallback(
    (updatedProduct: Product, action?: string, change?: number) => {
      try {
        setProducts((prevProducts) => prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

        setColumns((prevColumns) => {
          let allProductIds = prevColumns
            .flatMap((col) => col.productIds)
            .filter((id) => id.startsWith(updatedProduct.id))
            .sort((a, b) => {
              const [, aNum] = a.split("-")
              const [, bNum] = b.split("-")
              return Number.parseInt(aNum) - Number.parseInt(bNum)
            })

          const currentPalettes = allProductIds.length
          const newPalettes = updatedProduct.palettes

          if (newPalettes > currentPalettes) {
            const highestPaletteNumber =
              currentPalettes > 0 ? Number.parseInt(allProductIds[currentPalettes - 1].split("-")[1]) : 0
            const additionalPalettes = Array.from(
              { length: newPalettes - currentPalettes },
              (_, i) => `${updatedProduct.id}-${highestPaletteNumber + i + 1}`,
            )
            allProductIds = [...allProductIds, ...additionalPalettes]
          } else if (newPalettes < currentPalettes) {
            allProductIds = allProductIds.slice(0, newPalettes)
          }

          return prevColumns.map((column) => ({
            ...column,
            productIds: column.productIds
              .filter((id) => !id.startsWith(updatedProduct.id))
              .concat(column.id === "prominent" ? allProductIds : []),
          }))
        })

        if (action) {
          let auditAction = ""
          let details = ""

          switch (action) {
            case "items-per-palette-change":
              auditAction = "update-items-per-palette"
              details = `Changed items per palette ${change && change > 0 ? "increased" : "decreased"} to ${updatedProduct.itemsPerPalette}`
              break
            case "palettes-change":
              auditAction = "update-palettes"
              details = `Changed number of palettes ${change && change > 0 ? "increased" : "decreased"} to ${updatedProduct.palettes}`
              break
            default:
              auditAction = "update-product"
              details = `Updated product information`
          }

          addAuditEntry({
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            productCode: updatedProduct.code,
            productColor: updatedProduct.color,
            action: auditAction,
            details,
          })
        }
      } catch (error) {
        console.error("Error in updateProduct:", error)
      }
    },
    [addAuditEntry],
  )

  // Edit product details function with proper typing
  const editProductDetails = useCallback(
    (updatedProduct: Product) => {
      try {
        const originalProduct = products.find((p) => p.id === updatedProduct.id)

        if (!originalProduct) return

        const nameChanged = originalProduct.name !== updatedProduct.name
        const codeChanged = originalProduct.code !== updatedProduct.code

        let details = ""
        if (nameChanged && codeChanged) {
          details = `Changed product name from "${originalProduct.name}" to "${updatedProduct.name}" and code from "${originalProduct.code}" to "${updatedProduct.code}"`
        } else if (nameChanged) {
          details = `Changed product name from "${originalProduct.name}" to "${updatedProduct.name}"`
        } else if (codeChanged) {
          details = `Changed product code from "${originalProduct.code}" to "${updatedProduct.code}"`
        }

        addAuditEntry({
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          productCode: updatedProduct.code,
          productColor: updatedProduct.color,
          action: "edit-product-details",
          details,
        })

        setProducts((prevProducts) => prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
      } catch (error) {
        console.error("Error in editProductDetails:", error)
      }
    },
    [products, addAuditEntry],
  )

  // Delete product function with proper typing
  const deleteProduct = useCallback(
    (productId: string) => {
      try {
        const productToDelete = products.find((p) => p.id === productId)

        if (!productToDelete) return

        addAuditEntry({
          productId,
          productName: productToDelete.name,
          productCode: productToDelete.code,
          productColor: productToDelete.color,
          action: "delete-product",
          details: `Deleted product: ${productToDelete.name} (${productToDelete.code})`,
        })

        if (lastMove && lastMove.productId === productId) {
          setLastMove(null)
        }

        setColumns((prevColumns) =>
          prevColumns.map((column) => ({
            ...column,
            productIds: column.productIds.filter((id) => !id.startsWith(productId)),
          })),
        )

        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId))

        if (isEditProductDialogOpen && selectedProduct?.id === productId) {
          setIsEditProductDialogOpen(false)
          setSelectedProduct(null)
        }

        setForceRerender((prev) => prev + 1)
      } catch (error) {
        console.error("Error in deleteProduct:", error)
      }
    },
    [products, lastMove, isEditProductDialogOpen, selectedProduct, addAuditEntry],
  )

  // Handle undo function with proper typing
  const handleUndo = useCallback(() => {
    try {
      if (!lastMove) return

      const productExists = products.some((p) => p.id === lastMove.productId)

      if (!productExists) {
        setLastMove(null)
        return
      }

      // Check if the undo operation is allowed based on user role
      const sourceColumn = columns.find((col) => col.title === lastMove.toColumn)
      const destColumn = columns.find((col) => col.title === lastMove.fromColumn)

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

      setColumns((prevColumns) => {
        const sourceColumn = prevColumns.find((col) => col.title === lastMove.toColumn)
        const destColumn = prevColumns.find((col) => col.title === lastMove.fromColumn)

        if (!sourceColumn || !destColumn) return prevColumns

        const movedItemId = `${lastMove.productId}-${lastMove.paletteNumber}`

        const newSourceProductIds = sourceColumn.productIds.filter((id) => id !== movedItemId)
        const newDestProductIds = [...destColumn.productIds, movedItemId]

        return prevColumns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, productIds: newSourceProductIds }
          }
          if (col.id === destColumn.id) {
            return { ...col, productIds: newDestProductIds }
          }
          return col
        })
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

      setAuditTrail((prevAuditTrail) => prevAuditTrail.filter((entry) => entry.id !== lastMove.id))
      setLastMove(null)
    } catch (error) {
      console.error("Error in handleUndo:", error)
      setLastMove(null)
    }
  }, [lastMove, addAuditEntry, products, columns, userRole, allowedMoves])

  // Handle edit product function with proper typing
  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsEditProductDialogOpen(true)
  }, [])

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
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex h-full bg-gray-100" key={forceRerender}>
        <div className="flex-1 flex flex-col p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold italic">PROMINENT INVENTORY TRACKER</h1>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm font-medium">User: {userName}</p>
              <p className="text-sm font-medium">Role: {userRole}</p>
            </div>
          </div>

          <ErrorBoundary>
            <ProductList
              products={products}
              onAddProduct={() => setIsAddProductDialogOpen(true)}
              onUpdateProduct={updateProduct}
              onEditProduct={handleEditProduct}
            />
          </ErrorBoundary>

          {lastMove && <UndoButton key={undoKey} onUndo={handleUndo} />}

          <DragDropContext key={`dnd-${forceRerender}`} onDragEnd={onDragEnd}>
            <ErrorBoundary>
              <KanbanBoard columns={columns} products={products} userRole={userRole} allowedMoves={allowedMoves} />
            </ErrorBoundary>
          </DragDropContext>
        </div>

        <ErrorBoundary>
          <AuditTrail auditTrail={auditTrail} products={products} />
        </ErrorBoundary>

        <AddProductDialog
          isOpen={isAddProductDialogOpen}
          onClose={() => setIsAddProductDialogOpen(false)}
          onAddProduct={addProduct}
        />

        <EditProductDialog
          isOpen={isEditProductDialogOpen}
          onClose={() => setIsEditProductDialogOpen(false)}
          product={selectedProduct}
          onUpdateProduct={editProductDetails}
          onDeleteProduct={deleteProduct}
        />
      </div>
    </div>
  )
}
