"use client"

import { useState } from "react"
import { Table } from "../../../components/ui/table"
import type { AuditLogItem } from "../types/audit"
import { format } from "date-fns"


interface AuditTableProps {
  auditRecords: AuditLogItem[]
}

export function AuditTable({ auditRecords }: AuditTableProps) {
  const [sortField, setSortField] = useState<keyof AuditLogItem>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: keyof AuditLogItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedRecords = [...auditRecords].sort((a, b) => {
    const aValue = a[sortField] || ""
    const bValue = b[sortField] || ""
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
  })

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              {["timestamp", "action", "User Name", "details","Job Linked"].map((field) => (
                <th
                  key={field}
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort(field as keyof AuditLogItem)}>
                    {field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
                    {sortField === field && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {format(new Date(), "MMM dd, yyyy HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {record.action}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {record.user_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {record.details}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {record.job_id}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="h-24 text-center text-gray-500 dark:text-gray-400">
                  No audit records found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  )
}


// interface AuditTableProps {
//   auditRecords: AuditRecord[]
// }


// export function AuditTable({ auditRecords }: AuditTableProps) {
//   const [sortField, setSortField] = useState<keyof AuditRecord>("timestamp")
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

//   const handleSort = (field: keyof AuditRecord) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc")
//     } else {
//       setSortField(field)
//       setSortDirection("asc")
//     }
//   }

//   // Sort audit records
//   const sortedRecords = [...auditRecords].sort((a, b) => {
//     const aValue = a[sortField] || ""
//     const bValue = b[sortField] || ""

//     if (sortDirection === "asc") {
//       return aValue > bValue ? 1 : -1
//     } else {
//       return aValue < bValue ? 1 : -1
//     }
//   })

//   return (
//     <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
//       <div className="max-w-full overflow-x-auto">
//         <Table>
//           <thead className="border-b border-gray-100 dark:border-white/[0.05]">
//             <tr>
//               <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                 <div className="flex items-center cursor-pointer" onClick={() => handleSort("timestamp")}>
//                   Timestamp
//                   {sortField === "timestamp" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
//                 </div>
//               </th>
//               <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                 <div className="flex items-center cursor-pointer" onClick={() => handleSort("action")}>
//                   Action
//                   {sortField === "action" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
//                 </div>
//               </th>
//               <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                 <div className="flex items-center cursor-pointer" onClick={() => handleSort("user")}>
//                   User
//                   {sortField === "user" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
//                 </div>
//               </th>
//               <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
//                 <div className="flex items-center cursor-pointer" onClick={() => handleSort("details")}>
//                   Details
//                   {sortField === "details" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
//                 </div>
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
//             {sortedRecords.length > 0 ? (
//               sortedRecords.map((record) => (
//                 <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
//                   <td className="px-5 py-4 sm:px-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                     {format(new Date(record.timestamp), "MMM dd, yyyy HH:mm:ss")}
//                   </td>
//                   <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                     {record.action}
//                   </td>
//                   <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{record.user}</td>
//                   <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
//                     {record.details}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={4} className="h-24 text-center text-gray-500 dark:text-gray-400">
//                   No audit records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       </div>
//     </div>
//   )
// }

