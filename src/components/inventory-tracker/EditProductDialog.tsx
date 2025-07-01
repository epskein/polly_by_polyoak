"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button/Button"
import { Input } from "../ui/input/Input"
import Label from "../form/Label"
import type { Product } from "../../types/inventory"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alertDialog"

type EditProductDialogProps = {
  product?: Product | null
  onUpdateProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export default function EditProductDialog({
  product,
  onUpdateProduct,
  onDeleteProduct,
  children,
  isOpen: externalOpen,
  onClose,
}: EditProductDialogProps) {
  if (!product) return null

  const [name, setName] = useState(product.name)
  const [code, setCode] = useState(product.code)
  const [isOpen, setIsOpen] = useState(externalOpen ?? false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen)
    }
  }, [externalOpen])

  useEffect(() => {
    if (product) {
      setName(product.name)
      setCode(product.code)
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product && name && code) {
      onUpdateProduct({
        ...product,
        name,
        code,
      })
      setIsOpen(false)
    }
  }

  const handleDelete = () => {
    if (product) {
      onDeleteProduct(product.id)
      setShowDeleteConfirm(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open && onClose) onClose()
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-code">Code</Label>
                <Input
                  id="edit-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Product
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product and all its palettes
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

