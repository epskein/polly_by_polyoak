"use client"

import type { AuditLogItem } from "../types/audit"
import { supabase } from "../../../lib/supabase";

export const addAuditRecord = async (record: AuditLogItem) => {
  const { error } = await supabase.from("audit_log").insert([record]);
  if (error) throw error;
};

export const getAuditTrailForJob = async (jobId: string): Promise<AuditLogItem[]> => {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchAllAuditLogs = async (): Promise<AuditLogItem[]> => {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("❌ Error fetching audit logs:", error.message)
    return []
  }

  return data as AuditLogItem[]
}
