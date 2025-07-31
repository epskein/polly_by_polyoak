// src/pages/ProminentInventory/components/ProductList.tsx
import React, { useState } from 'react';
import { Product } from '../types';
import AddProductDialog from './AddProductDialog';
import EditProductDialog from './EditProductDialog';

interface ProductListProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ onAddProduct, onUpdateProduct, onDeleteProduct, products }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Product List</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Add Product
        </button>
      </div>
      <AddProductDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={onAddProduct}
      />
      {selectedProduct && (
        <EditProductDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={onUpdateProduct}
          onDelete={onDeleteProduct}
          product={selectedProduct}
        />
      )}
      <div className="mt-4 space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow"
          >
            <div className="flex items-center space-x-4">
              <span
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: product.color }}
              ></span>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">{product.description}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>Stock: {product.stockCode}</span>
                  <span className="mx-2">|</span>
                  <span>Supplier: {product.supplierCode}</span>
                  <span className="mx-2">|</span>
                  <span>Palettes: {product.palettes}</span>
                  <span className="mx-2">|</span>
                  <span>Items per Palette: {product.itemsPerPalette}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleEditClick(product)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
