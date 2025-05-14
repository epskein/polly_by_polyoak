"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import Button from "../ui/button/Button"
import Input from "../ui/input/Input"
import Label from "../ui/label/label"
import type { Product } from "../../types/inventory"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
  } from "../ui/alertDialog";

type EditProductDialogProps = {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onUpdateProduct: (product: Product) => void
    onDeleteProduct: (productId: string) => void
}

export default function EditProductDialog({
    isOpen,
    onClose,
    product,
    onUpdateProduct,
    onDeleteProduct,
}: EditProductDialogProps) {
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Update local state when product changes
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
            onClose()
        }
    }

    const handleDelete = () => {
        if (product) {
            onDeleteProduct(product.id)
            setShowDeleteConfirm(false)
            onClose()
        }
    }

    return (
        <>
            <Dialog isOpen={isOpen} onClose={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" >
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={name}
                                    onChange={(e: { target: { value: React.SetStateAction<string> } }) => setName(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-code" >
                                    Code
                                </Label>
                                <Input
                                    id="edit-code"
                                    value={code}
                                    onChange={(e: { target: { value: React.SetStateAction<string> } }) => setCode(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter >
                            <Button onClick={() => setShowDeleteConfirm(true)}>
                                Delete Product
                            </Button>
                            <Button >Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the product and all its palettes from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

