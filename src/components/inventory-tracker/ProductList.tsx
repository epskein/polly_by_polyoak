"use client"

import type { Product } from "../../types/inventory"
import { FaPlus, FaEdit } from "react-icons/fa"
import { Button } from "../ui/button/Button"
import ProductInventoryManager from "./ProductInventoryManager"
import { AddProductDialog } from "./AddProductDialog"
import EditProductDialog from "./EditProductDialog"

type ProductListProps = {
  products: Product[]
  onAddProduct: (newProduct: Omit<Product, "id">) => void
  onUpdateProduct: (updatedProduct: Partial<Product> & { id: string }) => void
  onDeleteProduct: (productId: string) => void
  onEditProduct: (product: Product) => void
}

export default function ProductList({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onEditProduct
}: ProductListProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Product List</h2>
        <AddProductDialog onAddProduct={onAddProduct}>
          <Button size="sm">
            <FaPlus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </AddProductDialog>
      </div>
      <ul className="space-y-2">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between bg-white p-2 rounded-lg shadow"
          >
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded-full mr-2"
                style={{ backgroundColor: product.color }}
              ></div>
              <span className="font-medium">{product.name}</span>
              <Button size="sm" className="ml-2" onClick={() => onEditProduct(product)}>
                  <FaEdit className="h-4 w-4" />
              </Button>
            </div>
            <ProductInventoryManager
              product={product}
              onUpdate={onUpdateProduct}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
