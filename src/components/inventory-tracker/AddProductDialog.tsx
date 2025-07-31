"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button/Button"
import Label from "../form/Label"
import type { Product } from "../../types/inventory"
import { Input } from "../ui/input/Input"
import { ColorPicker } from "../form/ColorPicker"

// In your AddProductDialog.tsx file
interface AddProductDialogProps {
  onAddProduct: (newProduct: Omit<Product, "id">) => void
  children: React.ReactNode
}
export function AddProductDialog({
  onAddProduct,
  children,
}: AddProductDialogProps) {
  const [newProduct, setNewProduct] = useState({
    name: "",
    supplierCode: "",
    stockCode: "",
    palettes: 0,
    status: "in-stock",
    arrivalDate: new Date().toISOString().split("T")[0],
    color: "#ffffff",
    stock: 0,
    code: "",
    itemsPerPalette: 25, // Default value
  })
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleSetColor = (color: string) => {
    setNewProduct((prev) => ({ ...prev, color }))
  }

  const handleAdd = () => {
    onAddProduct(newProduct)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Description</Label>
            <Input
              id="name"
              name="name"
              value={newProduct.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="supplierCode">Supplier Code</Label>
            <Input
              id="supplierCode"
              name="supplierCode"
              value={newProduct.supplierCode}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="stockCode">Stock Code</Label>
            <Input
              id="stockCode"
              name="stockCode"
              value={newProduct.stockCode}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="palettes">No. of Palettes</Label>
            <Input
              id="palettes"
              name="palettes"
              type="number"
              value={newProduct.palettes}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <ColorPicker color={newProduct.color} setColor={handleSetColor} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

