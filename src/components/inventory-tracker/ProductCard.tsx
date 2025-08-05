"use client"

import type { Product, Pallet } from "../../types/inventory"
import { Draggable } from "react-beautiful-dnd"
import { useCallback } from "react"

type ProductCardProps = {
  product: Product
  pallet: Pallet
  index: number
  userRole?: string
  allowedMoves?: Record<string, Record<string, string[]>>
  sourceColumnId?: string
}

export default function ProductCard({
  product,
  pallet,
  index,
  userRole = "viewer",
  allowedMoves,
  sourceColumnId,
}: ProductCardProps) {
  const getContrastColor = useCallback((hexColor: string) => {
    try {
      if (hexColor.startsWith("hsl")) {
        const match = hexColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
        if (match) {
          const lightness = Number.parseInt(match[3], 10)
          return lightness > 50 ? "#000000" : "#FFFFFF"
        }
        return "#FFFFFF"
      }

      const r = Number.parseInt(hexColor.slice(1, 3), 16)
      const g = Number.parseInt(hexColor.slice(3, 5), 16)
      const b = Number.parseInt(hexColor.slice(5, 7), 16)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5 ? "#000000" : "#FFFFFF"
    } catch (e) {
      console.error("Error parsing color:", e)
      return "#FFFFFF"
    }
  }, [])

  const isDragDisabled = useCallback(() => {
    if (!allowedMoves || !sourceColumnId || !userRole) return false
    if (!allowedMoves[userRole]) return true
    return !allowedMoves[userRole][sourceColumnId] || allowedMoves[userRole][sourceColumnId].length === 0
  }, [allowedMoves, sourceColumnId, userRole])

  try {
    return (
      <Draggable draggableId={pallet.id} index={index} isDragDisabled={isDragDisabled()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`rounded-lg p-4 mb-2 shadow relative ${isDragDisabled() ? "opacity-70 cursor-not-allowed" : ""} ${snapshot.isDragging ? "z-10" : ""}`}
            style={{
              ...provided.draggableProps.style,
              backgroundColor: product.color || "#CCCCCC",
              color: getContrastColor(product.color || "#CCCCCC"),
            }}
          >
            <div className="absolute top-1 right-2 text-xs font-bold">
              #{pallet.id.substring(0, 4)}...
            </div>
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm">Supplier Code: {product.supplierCode}</p>
            <p className="text-sm">Stock Code: {product.stockCode}</p>
            <p className="text-sm">Quantity: 1 palette ({product.itemsPerPalette} items)</p>
            {isDragDisabled() && (
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded-lg">
                <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-80 rounded">
                  Not allowed to move
                </span>
              </div>
            )}
          </div>
        )}
      </Draggable>
    )
  } catch (error) {
    console.error("Error rendering ProductCard:", error)
    return null
  }
}
