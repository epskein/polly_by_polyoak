// src/pages/ProminentInventory/components/AddProductDialog.tsx
import React, { useState } from 'react';
import { Product } from '../types';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [product, setProduct] = useState({
    description: '',
    supplierCode: '',
    stockCode: '',
    itemsPerPalette: 0,
    palettes: 0,
    color: '#ffffff',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(product);
    onClose();
    // Reset form
    setProduct({
      description: '',
      supplierCode: '',
      stockCode: '',
      itemsPerPalette: 0,
      palettes: 0,
      color: '#ffffff',
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Product</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={product.description}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Code</label>
            <input
              type="text"
              name="supplierCode"
              value={product.supplierCode}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Code</label>
            <input
              type="text"
              name="stockCode"
              value={product.stockCode}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items per Palette</label>
            <input
              type="number"
              name="itemsPerPalette"
              value={product.itemsPerPalette}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Palettes</label>
            <input
              type="number"
              name="palettes"
              value={product.palettes}
              onChange={handleChange}
              className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colour</label>
            <input
              type="color"
              name="color"
              value={product.color}
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductDialog;