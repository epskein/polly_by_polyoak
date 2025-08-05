// src/pages/ProminentInventory/components/EditProductDialog.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete: (productId: string) => void;
  product: Product;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({ isOpen, onClose, onSave, onDelete, product }) => {
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({
      ...prev,
      [name]: (name === 'items_per_palette' || name === 'palettes') ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = () => {
    onSave(editedProduct);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product.id);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Product</h2>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 px-3 py-1 rounded-lg border border-red-500 hover:border-red-600"
          >
            Delete
          </button>
        </div>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={editedProduct.description}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Code</label>
            <input
              type="text"
              name="supplier_code"
              value={editedProduct.supplier_code ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Code</label>
            <input
              type="text"
              name="stock_code"
              value={editedProduct.stock_code ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items per Palette</label>
            <input
              type="number"
              name="items_per_palette"
              value={editedProduct.items_per_palette}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Palettes</label>
            <input
              type="number"
              name="palettes"
              value={editedProduct.palettes}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colour</label>
            <input
              type="color"
              name="color"
              value={editedProduct.color}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </form>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductDialog;
