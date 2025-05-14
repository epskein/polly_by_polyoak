"use client"

import type { Column, Product } from "../../types/inventory"
import { Droppable } from "react-beautiful-dnd"
import ProductCard from "./ProductCard"
import ErrorBoundary from "./ErrorBoundary"
import  Button  from "../../components/ui/button/Button"
import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

type KanbanBoardProps = {
  columns: Column[]
  products: Product[]
  userRole?: string
  allowedMoves?: Record<string, Record<string, string[]>>
}

export default function KanbanBoard({ columns, products, userRole = "viewer", allowedMoves }: KanbanBoardProps) {
  const [exporting, setExporting] = useState<string | null>(null)

  const exportToPDF = async (columnId: string, columnTitle: string) => {
    setExporting(columnId)
    try {
      const columnElement = document.getElementById(`column-${columnId}`)
      if (!columnElement) {
        console.error("Column element not found")
        return
      }

      const canvas = await html2canvas(columnElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`${columnTitle.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex-1 grid grid-cols-3 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="bg-white rounded-lg shadow flex flex-col">
          <h3 className="text-lg font-semibold p-4 border-b">{column.title}</h3>
          <div id={`column-${column.id}`} className="flex-1">
            <Droppable droppableId={column.id} isDropDisabled={false}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 min-h-[200px]">
                  <ErrorBoundary>
                    {column.productIds.map((productId, index) => {
                      try {
                        const [baseId, paletteNumber] = productId.split("-")
                        const product = products.find((p) => p.id === baseId)
                        if (!product) return null
                        return (
                          <ProductCard
                            key={productId}
                            product={product}
                            paletteNumber={Number.parseInt(paletteNumber)}
                            index={index}
                            userRole={userRole}
                            allowedMoves={allowedMoves}
                            sourceColumnId={column.id}
                          />
                        )
                      } catch (error) {
                        console.error("Error processing product ID:", productId, error)
                        return null
                      }
                    })}
                  </ErrorBoundary>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div className="p-4 border-t">
            <Button
              onClick={() => exportToPDF(column.id, column.title)}
              disabled={exporting === column.id}
              className="w-full"
            >
              {exporting === column.id ? "Exporting..." : `Export ${column.title} to PDF`}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
