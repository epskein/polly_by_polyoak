"use client"

import { useState, useEffect } from "react"
import type { AuditLogItem } from "../types/audit"
import { supabase } from "../../../lib/supabase";

// export interface AuditLogItem {
//   id?: string;
//   job_id: string;
//   timestamp?: string;
//   action: string;
//   user_name: string;
//   details: string;
// }

export const addAuditRecord = async (record: AuditLogItem) => {
  const { error } = await supabase.from("audit_log").insert([record]);
  await fetchAllAuditLogs();
  if (error) throw error;
};

export const getAuditTrailForJob = async (jobId: string): Promise<AuditLogItem[]> => {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("job_id", jobId)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchAllAuditLogs = async (): Promise<AuditLogItem[]> => {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("❌ Error fetching audit logs:", error.message)
    return []
  }

  return data as AuditLogItem[]
}


// // Sample data
// const initialAuditRecords: AuditRecord[] = [
//   {
//     id: "1",
//     timestamp: "2023-03-15T10:30:00.000Z",
//     action: "Create",
//     user: "John Doe",
//     details: "Created job: Quality Testing for Product XYZ",
//   },
//   {
//     id: "2",
//     timestamp: "2023-03-18T14:45:00.000Z",
//     action: "Create",
//     user: "Jane Smith",
//     details: "Created job: Calibration Check for Lab Equipment",
//   },
//   {
//     id: "3",
//     timestamp: "2023-03-22T09:15:00.000Z",
//     action: "Create",
//     user: "Bob Johnson",
//     details: "Created job: Material Analysis for New Product",
//   },
// ]

// export function useAudit() {
//   const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(initialAuditRecords)

//   // Load audit records from localStorage on initial render
//   useEffect(() => {
//     const savedRecords = localStorage.getItem("quality-lab-audit")
//     if (savedRecords) {
//       try {
//         setAuditRecords(JSON.parse(savedRecords))
//       } catch (error) {
//         console.error("Error parsing saved audit records:", error)
//         // If there's an error parsing, use the initial records
//         setAuditRecords(initialAuditRecords)
//       }
//     }
//   }, [])

//   // Save audit records to localStorage whenever they change
//   useEffect(() => {
//     try {
//       localStorage.setItem("quality-lab-audit", JSON.stringify(auditRecords))
//     } catch (error) {
//       console.error("Error saving audit records to localStorage:", error)
//     }
//   }, [auditRecords])

//   const addAuditRecord = (record: AuditRecord) => {
//     // Create a new record with a timestamp if not provided
//     const newRecord = {
//       ...record,
//       id: record.id || Date.now().toString(),
//       timestamp: record.timestamp || new Date().toISOString(),
//     }

//     console.log("Adding audit record:", newRecord)

//     // Add the new record to the beginning of the array
//     setAuditRecords((prevRecords) => {
//       const newRecords = [newRecord, ...prevRecords]
//       console.log("Updated audit records:", newRecords.length)
//       return newRecords
//     })

//     return newRecord
//   }

//   return { auditRecords, addAuditRecord }
//}



