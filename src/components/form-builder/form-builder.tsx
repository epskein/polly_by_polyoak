"use client"

import { useState, useEffect } from "react"
import { Save, Table, Edit2, ArrowUp, ArrowDown, Eye, Trash2 } from 'lucide-react'
import { useAtom } from "jotai"
import { savedTemplatesAtom } from "../../store/atoms"
import type { SavedTemplate, User, FormVersion } from "../../types/inventory"

// Define types for our component state
interface CustomField {
  id: number
  name: string
  type: string
  options?: string[]
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

interface FormComponent {
  type: 'field' | 'table'
  field?: CustomField
  table?: TableData
}

interface PreviewDialogProps {
  template: SavedTemplate | null
  open: boolean
  onClose: () => void
}

const FormBuilder = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [departments, setDepartments] = useState<string[]>([
    "Visconti",
    "Tubs",
    "Raw Materials",
    "Preforms",
    "African Closures",
    "Blowpack",
    "PolyPet",
    "Contan",
    "Lubripack",
    "Dairypack",
  ])
  const [documentTypes, setDocumentTypes] = useState<string[]>([
    "Report",
    "Request",
    "Review",
    "Checklist",
    "Cleaning Schedule - Area",
    "Cleaning Schedule - Vehicle",
    "Cleaning Schedule - Machine",
    "ISIR",
    "Inspection",
    "Register",
    "Cleaning Schedule",
  ])
  const [newDepartment, setNewDepartment] = useState("")
  const [newDocType, setNewDocType] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")

  const [fields, setFields] = useState<CustomField[]>([
    { id: 1, name: "Date", type: "date" },
    { id: 2, name: "Supervisor Signature", type: "text" },
    { id: 3, name: "Region", type: "select", options: ["North", "South", "East", "West"] },
    { id: 4, name: "Machine", type: "select", options: ["Machine A", "Machine B"] },
    { id: 5, name: "Comment", type: "textarea" },
  ])

  const [formComponents, setFormComponents] = useState<FormComponent[]>([])
  const [selectedFields, setSelectedFields] = useState<CustomField[]>([])
  const [newField, setNewField] = useState<{ name: string; type: string }>({ name: "", type: "text" })

  const [tables, setTables] = useState<TableData[]>([])
  const [newTable, setNewTable] = useState<TableData>({
    id: 0,
    name: "",
    columns: [],
    rows: [],
    type: "",
    reminderFrequency: "",
    reminderTime: "",
    reminderDay: "",
    linkedTableId: null,
  })

  const [savedTemplates, setSavedTemplates] = useAtom(savedTemplatesAtom)
  const [previewTemplate, setPreviewTemplate] = useState<SavedTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [newCustomField, setNewCustomField] = useState<{ name: string; type: string }>({ name: "", type: "text" })

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const addCustomField = () => {
    if (newCustomField.name) {
      const newFieldItem: CustomField = { ...newCustomField, id: Date.now() }
      setCustomFields([...customFields, newFieldItem])
      setFields([...fields, newFieldItem])
      setNewCustomField({ name: "", type: "text" })
    }
  }

  const handleAddRow = (tableId: number) => {
    setTables(
      tables.map((table) => {
        if (table.id === tableId) {
          const newRow = table.columns.map((col) => ({
            value: col.type === "checkbox" ? false : "",
            type: col.type,
          }))
          return {
            ...table,
            rows: [...table.rows, newRow],
          }
        }
        return table
      }),
    )
  }

  const handleDeleteTable = (tableId: number) => {
    setTables(tables.filter((table) => table.id !== tableId))
    setFormComponents(
      formComponents.filter((component) => !(component.type === "table" && component.table?.id === tableId)),
    )
  }

  const handleAddColumn = (tableId: number) => {
    setTables(
      tables.map((table) => {
        if (table.id === tableId) {
          const newColumn: TableColumn = {
            name: `Column ${table.columns.length + 1}`,
            type: "text",
          }
          return {
            ...table,
            columns: [...table.columns, newColumn],
            rows: table.rows.map((row) => [...row, { value: "", type: "text" }]),
          }
        }
        return table
      }),
    )
  }

  const handleSetColumnType = (tableId: number, columnIndex: number, type: string) => {
    setTables(
      tables.map((table) => {
        if (table.id === tableId) {
          const updatedColumns = [...table.columns]
          updatedColumns[columnIndex] = { ...updatedColumns[columnIndex], type }

          const updatedRows = table.rows.map((row) => {
            const newRow = [...row]
            newRow[columnIndex] = {
              value: type === "checkbox" ? false : "",
              type,
            }
            return newRow
          })

          return {
            ...table,
            columns: updatedColumns,
            rows: updatedRows,
          }
        }
        return table
      }),
    )
  }

  const handleCellChange = (tableId: number, rowIndex: number, columnIndex: number, value: string | boolean) => {
    setTables(
      tables.map((table) => {
        if (table.id === tableId) {
          const updatedRows = [...table.rows]
          updatedRows[rowIndex] = [...updatedRows[rowIndex]]
          updatedRows[rowIndex][columnIndex] = {
            ...updatedRows[rowIndex][columnIndex],
            value,
          }
          return {
            ...table,
            rows: updatedRows,
          }
        }
        return table
      }),
    )
  }

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < formComponents.length) {
      const newComponents = [...formComponents]
      ;[newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]]
      setFormComponents(newComponents)
    }
  }

  const handleSaveTemplate = () => {
    // Create a mock user for the template
    const mockUser: User = {
      id: "system",
      name: "System User"
    }

    const existingTemplateIndex = savedTemplates.findIndex(
      (t: { department: string; documentType: string }) => t.department === selectedDepartment && t.documentType === selectedDocType,
    )

    const newVersion: FormVersion = {
      version: existingTemplateIndex !== -1 ? savedTemplates[existingTemplateIndex].currentVersion + 1 : 1,
      createdAt: new Date().toISOString(),
      createdBy: mockUser,
    }

    const updatedTemplate: SavedTemplate = {
      id: existingTemplateIndex !== -1 ? savedTemplates[existingTemplateIndex].id : Date.now(),
      department: selectedDepartment,
      documentType: selectedDocType,
      fields: selectedFields,
      components: formComponents.map((component) => {
        if (component.type === "table" && component.table) {
          const fullTable = tables.find((t) => t.id === component.table?.id)
          return {
            type: "table",
            table: fullTable,
          }
        }
        return component
      }),
      versions:
        existingTemplateIndex !== -1 ? [...savedTemplates[existingTemplateIndex].versions, newVersion] : [newVersion],
      currentVersion: newVersion.version,
    }

    if (existingTemplateIndex !== -1) {
      // Update existing template
      setSavedTemplates(savedTemplates.map((t: any, index: any) => (index === existingTemplateIndex ? updatedTemplate : t)))
    } else {
      // Add new template
      setSavedTemplates([...savedTemplates, updatedTemplate])
    }
  }

  const handleEditTable = (tableId: number) => {
    console.log("Editing table:", tableId)
  }

  const handleAddField = (field: CustomField) => {
    setSelectedFields([...selectedFields, field])
    setFormComponents([...formComponents, { type: "field", field }])
  }

  const handleLinkTable = (reminderTableId: number, informationTableId: number | null) => {
    setTables(
      tables.map((table) => {
        if (table.id === reminderTableId) {
          return { ...table, linkedTableId: informationTableId }
        }
        return table
      }),
    )
  }

  const PreviewDialog = ({ template, open, onClose }: PreviewDialogProps) => {
    if (!open || !template) return null

    const currentVersion = template.versions.find((v: { version: any }) => v.version === template.currentVersion)
    if (!currentVersion) return null

    const generateDocCode = (department: string, docType: string) => {
      const deptCode = department.slice(0, 3).toUpperCase()
      const docTypeCode = docType
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
      return `${docTypeCode}-${deptCode}-001`
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Form Preview</h2>
            <div className="text-sm text-gray-600">
              <p>Version {currentVersion.version}</p>
              <p>Created by {currentVersion.createdBy.name}</p>
              <p>{new Date(currentVersion.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Title</label>
                <div className="mt-1 text-lg font-medium">{`${template?.documentType} - ${template?.department}`}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Code</label>
                <div className="mt-1 text-lg font-medium">
                  {generateDocCode(template?.department || "", template?.documentType || "")}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {template?.components?.map((component: any, index: number) => (
              <div key={index} className="p-4 border rounded">
                {component.type === "table" && component.table && (
                  <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-2">{component.table.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Type: {component.table.type}
                      {component.table.type === "reminder" && (
                        <>
                          , Frequency: {component.table.reminderFrequency}
                          {component.table.reminderFrequency === "daily" && `, Time: ${component.table.reminderTime}`}
                          {component.table.reminderFrequency === "weekly" && `, Day: ${component.table.reminderDay}`}
                          {component.table.reminderFrequency === "monthly" &&
                            `, Day: ${component.table.reminderDay === "first" ? "1st" : "Last"} day of the month`}
                          {component.table.reminderFrequency === "quarterly" &&
                            `, ${component.table.reminderDay} of quarter`}
                          {(component.table.reminderFrequency === "biannually" ||
                            component.table.reminderFrequency === "annually") &&
                            `, Date: ${component.table.reminderDay}`}
                          {component.table.linkedTableId && (
                            <>
                              , Linked to:{" "}
                              {
                                template.components.find(
                                  (c: any) => c.type === "table" && c.table.id === component.table.linkedTableId,
                                )?.table.name
                              }
                            </>
                          )}
                        </>
                      )}
                    </p>
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          {component.table.columns?.map((col: any, colIndex: number) => (
                            <th key={colIndex} className="border border-gray-300 px-4 py-2 text-left">
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {component.table.rows?.length > 0 ? (
                          component.table.rows.map((row: any, rowIndex: number) => (
                            <tr key={rowIndex} className="even:bg-gray-50">
                              {row.map((cell: any, cellIndex: number) => (
                                <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                  {cell.type === "checkbox" ? (
                                    <input
                                      type="checkbox"
                                      checked={cell.value}
                                      readOnly
                                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                  ) : (
                                    cell.value || "-"
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={component.table.columns?.length || 1}
                              className="border border-gray-300 px-4 py-2 text-center"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {component.type === "field" && component.field && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{component.field.name}</label>
                    {component.field.type === "text" && (
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={component.field.name}
                      />
                    )}
                    {component.field.type === "textarea" && (
                      <textarea
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={component.field.name}
                      />
                    )}
                    {component.field.type === "date" && (
                      <input type="date" disabled className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    )}
                    {component.field.type === "select" && (
                      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        {component.field.options?.map((option: string, i: number) => (
                          <option key={i}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 w-auto-full mx-auto space-y-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Form Builder</h1>
          <h3 className="text-l font-italic text-gray-800">
            This section of the application allows users to re-create an old or new form, to be filled in by each
            relevant department.
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Department and Document Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <div className="flex space-x-2">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="New Department"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
                <button
                  onClick={() => {
                    if (newDepartment && !departments.includes(newDepartment)) {
                      setDepartments([...departments, newDepartment])
                      setNewDepartment("")
                    }
                  }}
                  className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <div className="flex space-x-2">
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map((docType) => (
                    <option key={docType} value={docType}>
                      {docType}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  placeholder="New Document Type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
                <button
                  onClick={() => {
                    if (newDocType && !documentTypes.includes(newDocType)) {
                      setDocumentTypes([...documentTypes, newDocType])
                      setNewDocType("")
                    }
                  }}
                  className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Table Builder */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center space-x-2 space-y-2">
              <input
                placeholder="Table Name"
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newTable.type || ""}
                onChange={(e) => setNewTable({ ...newTable, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Table Type</option>
                <option value="information">Information Table</option>
                <option value="reminder">Reminder Table</option>
              </select>
              {newTable.type === "reminder" && (
                <>
                  <select
                    value={newTable.reminderFrequency || ""}
                    onChange={(e) =>
                      setNewTable({ ...newTable, reminderFrequency: e.target.value, reminderTime: "", reminderDay: "" })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Bi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                  {newTable.reminderFrequency === "daily" && (
                    <select
                      value={newTable.reminderTime}
                      onChange={(e) => setNewTable({ ...newTable, reminderTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  )}
                  {newTable.reminderFrequency === "weekly" && (
                    <select
                      value={newTable.reminderDay}
                      onChange={(e) => setNewTable({ ...newTable, reminderDay: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Every Monday</option>
                      <option value="Friday">Every Friday</option>
                    </select>
                  )}
                  {newTable.reminderFrequency === "monthly" && (
                    <select
                      value={newTable.reminderDay}
                      onChange={(e) => setNewTable({ ...newTable, reminderDay: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Day</option>
                      <option value="first">1st day of the month</option>
                      <option value="last">Last day of the month</option>
                    </select>
                  )}
                  {newTable.reminderFrequency === "quarterly" && (
                    <select
                      value={newTable.reminderDay}
                      onChange={(e) => setNewTable({ ...newTable, reminderDay: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Day</option>
                      <option value="start">Start of quarter</option>
                      <option value="end">End of quarter</option>
                    </select>
                  )}
                  {(newTable.reminderFrequency === "biannually" || newTable.reminderFrequency === "annually") && (
                    <input
                      type="date"
                      value={newTable.reminderDay}
                      onChange={(e) => setNewTable({ ...newTable, reminderDay: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                  <select
                    value={newTable.linkedTableId?.toString() || ""}
                    onChange={(e) =>
                      setNewTable({ ...newTable, linkedTableId: e.target.value ? Number(e.target.value) : null })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Link to Information Table</option>
                    {tables
                      .filter((t) => t.type === "information")
                      .map((table) => (
                        <option key={table.id} value={table.id.toString()}>
                          {table.name}
                        </option>
                      ))}
                  </select>
                </>
              )}
              <button
                onClick={() => {
                  if (newTable.name && newTable.type) {
                    const table: TableData = {
                      ...newTable,
                      id: tables.length + 1,
                      rows: [],
                      columns: [],
                    }
                    setTables([...tables, table])
                    setFormComponents([...formComponents, { type: "table", table }])
                    setNewTable({
                      id: 0,
                      name: "",
                      columns: [],
                      rows: [],
                      type: "",
                      reminderFrequency: "",
                      reminderTime: "",
                      reminderDay: "",
                      linkedTableId: null,
                    })
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Table className="w-5 h-5 mr-2" />
                Add Table
              </button>
            </div>

            {/* Tables Display */}
            <div className="space-y-4">
              {tables.map((table) => (
                <div key={table.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{table.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddColumn(table.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Add Column
                      </button>
                      <button
                        onClick={() => handleAddRow(table.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Add Row
                      </button>
                      <button
                        onClick={() => handleEditTable(table.id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {table.type === "reminder" && (
                        <select
                          value={table.linkedTableId?.toString() || ""}
                          onChange={(e) => handleLinkTable(table.id, e.target.value ? Number(e.target.value) : null)}
                          className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Link to Information Table</option>
                          {tables
                            .filter((t) => t.type === "information")
                            .map((infoTable) => (
                              <option key={infoTable.id} value={infoTable.id.toString()}>
                                {infoTable.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Table Content */}
                  {table.columns.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            {table.columns.map((column, colIndex) => (
                              <th key={colIndex} className="border p-2">
                                <input
                                  value={column.name}
                                  onChange={(e) => {
                                    const updatedTables = tables.map((t) => {
                                      if (t.id === table.id) {
                                        const newColumns = [...t.columns]
                                        newColumns[colIndex].name = e.target.value
                                        return { ...t, columns: newColumns }
                                      }
                                      return t
                                    })
                                    setTables(updatedTables)
                                  }}
                                  className="w-full px-2 py-1 border rounded"
                                />
                                <select
                                  value={column.type}
                                  onChange={(e) => handleSetColumnType(table.id, colIndex, e.target.value)}
                                  className="w-full mt-2 px-2 py-1 border rounded"
                                >
                                  <option value="text">Text</option>
                                  <option value="checkbox">Checkbox</option>
                                </select>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="even:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border p-2">
                                  {cell.type === "checkbox" ? (
                                    <input
                                      type="checkbox"
                                      checked={cell.value as boolean}
                                      onChange={(e) =>
                                        handleCellChange(table.id, rowIndex, cellIndex, e.target.checked)
                                      }
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                  ) : (
                                    <input
                                      value={cell.value as string}
                                      onChange={(e) => handleCellChange(table.id, rowIndex, cellIndex, e.target.value)}
                                      className="w-full px-2 py-1 border rounded"
                                    />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {table.type === "reminder" && table.linkedTableId && (
                    <div className="mt-2 text-sm text-gray-600">
                      Linked to: {tables.find((t) => t.id === table.linkedTableId)?.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create Custom Field Section */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium text-gray-900">Create Custom Field</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCustomField.name}
                onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })}
                placeholder="Field Name"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newCustomField.type}
                onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Small Text</option>
                <option value="textarea">Large Text</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
              </select>
              <button
                onClick={addCustomField}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Field
              </button>
            </div>
          </div>

          {/* Add Fields Section */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium text-gray-900">Add Fields</h3>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`field-${field.id}`}
                    checked={selectedFields.some((f) => f.id === field.id)}
                    onChange={() => {
                      if (selectedFields.some((f) => f.id === field.id)) {
                        setSelectedFields(selectedFields.filter((f) => f.id !== field.id))
                        setFormComponents(
                          formComponents.filter((c) => !(c.type === "field" && c.field?.id === field.id)),
                        )
                      } else {
                        handleAddField(field)
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`field-${field.id}`} className="text-sm text-gray-700">
                    {field.name} ({field.type})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Component Reordering */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Form Components Order</label>
            <div className="space-y-2">
              {formComponents.map((component, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span>{component.type === "field" ? component.field?.name : component.table?.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveComponent(index, "up")}
                      disabled={index === 0}
                      className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveComponent(index, "down")}
                      disabled={index === formComponents.length - 1}
                      className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveTemplate}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Form Template
          </button>
        </div>
      </div>

      {/* Saved Templates List */}
      {savedTemplates.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Saved Templates</h2>
          </div>
          <div className="p-6 space-y-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Department
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Document Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Version
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Updated
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedTemplates.map((template) => {
                  const latestVersion = template.versions[template.versions.length - 1]
                  return (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{template.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{template.documentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{template.currentVersion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(latestVersion.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{latestVersion.createdBy.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPreviewTemplate(template)
                            setShowPreview(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSavedTemplates(savedTemplates.filter((t: { id: any }) => t.id !== template.id))
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <PreviewDialog template={previewTemplate} open={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  )
}

export default FormBuilder