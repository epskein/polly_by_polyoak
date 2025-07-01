"use client"
import { FaPlus, FaMinus } from "react-icons/fa"
import { Button } from "../ui/button/Button"
import type { Product } from "../../types/inventory"

type ProductInventoryManagerProps = {
  product: Product
  onUpdate: (product: Product, action: "items-per-palette-change" | "palettes-change", change: number) => void
}

export default function ProductInventoryManager({ product, onUpdate }: ProductInventoryManagerProps) {
  const handleItemsPerPaletteChange = (change: number) => {
    const newItemsPerPalette = Math.max(1, product.itemsPerPalette + change)
    const newPalettes = Math.ceil(product.stock / newItemsPerPalette)
    onUpdate(
      { ...product, itemsPerPalette: newItemsPerPalette, palettes: newPalettes },
      "items-per-palette-change",
      change,
    )
  }

  const handlePalettesChange = (change: number) => {
    const newPalettes = Math.max(0, product.palettes + change)
    const newStock = newPalettes * product.itemsPerPalette
    onUpdate({ ...product, palettes: newPalettes, stock: newStock }, "palettes-change", change)
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Items/Palette:</span>
        <Button size="sm" variant="outline" onClick={() => handleItemsPerPaletteChange(-1)}>
          <FaMinus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center">{product.itemsPerPalette}</span>
        <Button size="sm" variant="outline" onClick={() => handleItemsPerPaletteChange(1)}>
          <FaPlus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Palettes:</span>
        <Button size="sm" variant="outline" onClick={() => handlePalettesChange(-1)}>
          <FaMinus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center">{product.palettes}</span>
        <Button size="sm" variant="outline" onClick={() => handlePalettesChange(1)}>
          <FaPlus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

