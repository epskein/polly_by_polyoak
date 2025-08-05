"use client"
import { FaPlus, FaMinus } from "react-icons/fa"
import { Button } from "../ui/button/Button"
import type { Product } from "../../types/inventory"
import { useAuthImplementation } from "../../hooks/useAuth"
import { addPallet, deletePallet, createAuditLog } from "../../pages/InventoryTracker/lib/actions"

type ProductInventoryManagerProps = {
  product: Product
  onUpdate: (product: Partial<Product> & { id: string }) => void
}

export default function ProductInventoryManager({ product, onUpdate }: ProductInventoryManagerProps) {
  const { user } = useAuthImplementation()

  const handleItemsPerPaletteChange = async (change: number) => {
    if (!user) {
        console.error("User not authenticated.")
        return
    }

    const newItemsPerPalette = Math.max(1, product.itemsPerPalette + change)
    onUpdate({ id: product.id, itemsPerPalette: newItemsPerPalette })

    await createAuditLog({
        user_id: user.id,
        action_type: 'EDIT_PRODUCT',
        product_id: product.id,
        details: {
            field: 'itemsPerPalette',
            oldValue: product.itemsPerPalette,
            newValue: newItemsPerPalette,
            change: change
        }
    })
  }

  const handlePalettesChange = async (change: number) => {
    if (!user) {
        console.error("User not authenticated.")
        return
    }

    const newPalettesCount = Math.max(0, product.palettes + change)
    onUpdate({ id: product.id, palettes: newPalettesCount })

    if (change > 0) {
        // Add a new pallet
        const newPallet = await addPallet(product.id, "In Stock") // Default status
        if (newPallet) {
            await createAuditLog({
                user_id: user.id,
                action_type: 'NEW_PRODUCT', // Or a more specific pallet action
                product_id: product.id,
                pallet_id: newPallet.id,
                details: {
                    change: 'Added 1 pallet'
                }
            })
        }
    } else {
        // This is a simplified deletion logic. It assumes we can delete any pallet,
        // which might not be the case. A more robust implementation would need to
        // identify which specific pallet to delete.
        console.warn("Pallet deletion from here is not fully implemented and will not delete a specific pallet record.")
    }
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
