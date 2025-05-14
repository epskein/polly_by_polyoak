"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import Button from "../ui/button/Button"
import Label from "../ui/label/label"
import type {  Product } from "../../types/inventory"
import Input from "../ui/input/Input"

// In your AddProductDialog.tsx file
type AddProductDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddProduct: (product: Omit<Product, "id" | "color" | "itemsPerPalette" | "palettes">) => void;
  };

export default function AddProductDialog({ isOpen, onClose, onAddProduct }: AddProductDialogProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [stock, setStock] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const stockNumber = Number.parseInt(stock, 10)
    if (name && code && !isNaN(stockNumber) && stockNumber >= 0) {
      onAddProduct({ name, code, stock: stockNumber })
      onClose()
      setName("")
      setCode("")
      setStock("")
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" >
                Name
              </Label>
              <Input id="name" value={name} onChange={(e: { target: { value: React.SetStateAction<string> } }) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" >
                Code
              </Label>
              <Input id="code" value={code} onChange={(e: { target: { value: React.SetStateAction<string> } }) => setCode(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" >
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setStock(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button >Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

