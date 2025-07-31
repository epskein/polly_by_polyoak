import React from 'react'

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

export function ColorPicker({ color, setColor }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-8 w-14 cursor-pointer rounded-md border-none bg-transparent p-0"
      />
      <span className="text-sm text-gray-600 dark:text-gray-300">{color}</span>
    </div>
  )
} 