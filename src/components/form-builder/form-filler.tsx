"use client"

import { useState, useEffect } from "react"
import { useAtom } from "jotai"
import { savedTemplatesAtom } from "../../store/atoms"
import { Printer } from 'lucide-react'
import type { SavedTemplate } from "../../types/inventory"

// Define types for our component state
interface FormData {
  [key: string]: string | boolean
}

interface TableColumn {
  name: string
  type: string
}

interface TableCell {
  value: string | boolean
  type: string
}

interface TableData {
  id: number
  name: string
  columns: TableColumn[]
  rows: TableCell[][]
  type: string
  reminderFrequency: string
  reminderTime: string
  reminderDay: string
  linkedTableId: number | null
}

interface FormField {
  id: number
  name: string
  type: string
  options?: string[]
}

interface FormComponent {
  type: 'field' | 'table'
  field?: FormField
  table?: TableData
}

const FormFiller = () => {
  const [savedTemplates] = useAtom(savedTemplatesAtom)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")
  const [formTemplate, setFormTemplate] = useState<SavedTemplate | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [vehicleRegNumber, setVehicleRegNumber] = useState("")
  const [machineName, setMachineName] = useState("")

  useEffect(() => {
    const template = savedTemplates.find(
      (t) => t.department === selectedDepartment && t.documentType === selectedDocType,
    )
    setFormTemplate(template || null)

    if (template) {
      // Initialize formData with default values
      const initialData: FormData = {}

      if (template.components && Array.isArray(template.components)) {
        template.components.forEach((component: FormComponent) => {
          if (component.type === "field" && component.field) {
            if (component.field.type === "date") {
              initialData[component.field.name] = new Date().toISOString().split("T")[0]
            } else {
              initialData[component.field.name] = ""
            }
          } else if (component.type === "table" && component.table) {
            component.table.rows.forEach((row, rowIndex) => {
              row.forEach((cell, cellIndex) => {
                initialData[`${component.table?.name}-${rowIndex}-${cellIndex}`] = cell.value || ""
              })
            })
          }
        })
      }

      setFormData(initialData)

      // Reset additional fields
      setVehicleRegNumber("")
      setMachineName("")
    } else {
      setFormData({})
      setVehicleRegNumber("")
      setMachineName("")
    }
  }, [selectedDepartment, selectedDocType, savedTemplates])

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }))
  }

  const renderFormFields = () => {
    if (!formTemplate || !formTemplate.components) return null

    return (
      <>
        {formTemplate.documentType === "Cleaning Schedule - Vehicle" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Vehicle Registration Number</label>
            <input
              type="text"
              value={vehicleRegNumber}
              onChange={(e) => setVehicleRegNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Enter Vehicle Registration Number"
            />
          </div>
        )}
        {formTemplate.documentType === "Cleaning Schedule - Machine" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Machine Name</label>
            <input
              type="text"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Enter Machine Name"
            />
          </div>
        )}
        {formTemplate.components.map((component: FormComponent, index: number) => {
          if (component.type === "field" && component.field) {
            const { name, type, options } = component.field
            return (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{name}</label>
                {type === "text" && (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={formData[name] as string || ""}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                  />
                )}
                {type === "textarea" && (
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={formData[name] as string || ""}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                  />
                )}
                {type === "select" && options && (
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={formData[name] as string || ""}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {type === "date" && (
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={formData[name] as string || ""}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                  />
                )}
              </div>
            )
          } else if (component.type === "table" && component.table) {
            return (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{component.table.name}</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {component.table.columns.map((column: TableColumn, colIndex: number) => (
                        <th
                          key={colIndex}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {component.table.rows.map((row: TableCell[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: TableCell, cellIndex: number) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                            {cell.type === "checkbox" ? (
                              <input
                                type="checkbox"
                                checked={formData[`${component.table?.name}-${rowIndex}-${cellIndex}`] as boolean || false}
                                onChange={(e) =>
                                  handleInputChange(
                                    `${component.table?.name}-${rowIndex}-${cellIndex}`,
                                    e.target.checked,
                                  )
                                }
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            ) : (
                              <input
                                type="text"
                                value={formData[`${component.table?.name}-${rowIndex}-${cellIndex}`] as string || ""}
                                onChange={(e) =>
                                  handleInputChange(`${component.table?.name}-${rowIndex}-${cellIndex}`, e.target.value)
                                }
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          return null
        })}
      </>
    )
  }

  const handleExportAndPrint = () => {
    if (!formTemplate) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
    <html>
      <head>
        <title>${formTemplate.department} - ${formTemplate.documentType}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .form-group input[type="text"],
          .form-group input[type="date"],
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
          .form-group textarea {
            height: 100px;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${formTemplate.department} - ${formTemplate.documentType}</h1>
        ${renderExportContent()}
        <button onclick="window.print()">Print</button>
      </body>
    </html>
  `)
    printWindow.document.close()
  }

  const renderExportContent = (): string => {
    if (!formTemplate || !formTemplate.components) return ""

    let content = ""

    if (formTemplate.documentType === "Cleaning Schedule - Vehicle") {
      content += `
        <div class="form-group">
          <label>Vehicle Registration Number:</label>
          <input type="text" value="${vehicleRegNumber}" readonly>
        </div>
      `
    } else if (formTemplate.documentType === "Cleaning Schedule - Machine") {
      content += `
        <div class="form-group">
          <label>Machine Name:</label>
          <input type="text" value="${machineName}" readonly>
        </div>
      `
    }

    formTemplate.components.forEach((component: FormComponent) => {
      if (component.type === "field" && component.field) {
        const { name, type, options } = component.field
        content += `
          <div class="form-group">
            <label>${name}:</label>
        `
        if (type === "text" || type === "date") {
          content += `<input type="${type}" value="${formData[name] || ""}" readonly>`
        } else if (type === "textarea") {
          content += `<textarea readonly>${formData[name] || ""}</textarea>`
        } else if (type === "select" && options) {
          content += `
            <select disabled>
              ${options.map((option) => `<option ${formData[name] === option ? "selected" : ""}>${option}</option>`).join("")}
            </select>
          `
        }
        content += `</div>`
      } else if (component.type === "table" && component.table) {
        content += `
          <h3>${component.table.name}</h3>
          <table>
            <thead>
              <tr>
                ${component.table.columns.map((column) => `<th>${column.name}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${component.table.rows
            .map(
              (row, rowIndex) => `
                <tr>
                  ${row
                  .map(
                    (cell, cellIndex) => `
                    <td>
                      ${cell.type === "checkbox"
                        ? `<input type="checkbox" ${formData[`${component.table?.name}-${rowIndex}-${cellIndex}`] ? "checked" : ""} disabled>`
                        : formData[`${component.table?.name}-${rowIndex}-${cellIndex}`] || ""
                      }
                    </td>
                  `,
                  )
                  .join("")}
                </tr>
              `,
            )
            .join("")}
            </tbody>
          </table>
        `
      }
    })

    return content
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Form Filler</h1>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            {Array.from(new Set(savedTemplates.map((t: { department: any }) => t.department))).filter((dept): dept is string =>
              typeof dept === 'string' && dept !== undefined && dept !== null
            ).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Document Type</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
          >
            <option value="">Select Document Type</option>
            {Array.from(new Set(savedTemplates.map((t: { documentType: any }) => t.documentType))).filter((type): type is string =>
              typeof type === 'string' && type !== undefined && type !== null
            ).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      {formTemplate ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {formTemplate.department} - {formTemplate.documentType}
          </h2>
          {renderFormFields()}
          <div className="mt-4 flex space-x-4">
            <button
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => console.log("Form data:", formData)}
            >
              Submit Form
            </button>
            <button
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
              onClick={handleExportAndPrint}
            >
              <Printer className="w-5 h-5 mr-2" />
              Export and Print
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">
          No template found for the selected department and document type. Please create a template first.
        </p>
      )}
    </div>
  )
}

export default FormFiller