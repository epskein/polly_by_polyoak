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
    category: "",
    supplier: "",
    cost: 0,
    quantity: 0,
    status: "in-stock",
    arrivalDate: new Date().toISOString().split("T")[0],
    color: "",
    stock: 0,
    code: "",
    itemsPerPalette: 0,
    palettes: 0,
  })
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
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
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={newProduct.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={newProduct.category}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              name="supplier"
              value={newProduct.supplier}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              name="cost"
              type="number"
              value={newProduct.cost}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={newProduct.quantity}
              onChange={handleChange}
            />
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

