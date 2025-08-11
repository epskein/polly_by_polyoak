"use client"

import type { Product } from "../../types/inventory"
import { FaEdit } from "react-icons/fa"
import { Button } from "../ui/button/Button"
import ProductInventoryManager from "./ProductInventoryManager"
import EditProductDialog from "./EditProductDialog"

type ProductListProps = {
  products: Product[]
  onUpdateProduct: (updatedProduct: Partial<Product> & { id: string }) => void
  onDeleteProduct: (productId: string) => void
}

export default function ProductList({
  products,
  onUpdateProduct,
  onDeleteProduct,
}: ProductListProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Product List</h2>
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
              <EditProductDialog
                product={product}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
              >
                <Button size="sm" className="ml-2">
                  <FaEdit className="h-4 w-4" />
                </Button>
              </EditProductDialog>
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
