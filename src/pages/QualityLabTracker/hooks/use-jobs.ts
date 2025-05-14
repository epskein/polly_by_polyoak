"use client"

import { useState, useEffect } from "react"
import type { Job } from "../types/job"
//import { useAudit } from "./use-audit"
import { supabase } from "../../../lib/supabase";

// // Sample data
// const initialJobs: Job[] = [
//   {
//     id: "1",
//     title: "Quality Testing for Product XYZ",
//     division: "Quality Control",
//     taskCategory: "Testing",
//     productCode: "PRD-001",
//     productDescription: "XYZ Analyzer System",
//     startDate: "2023-03-15T00:00:00.000Z",
//     comments: "Initial testing phase",
//     revisedDueDate: "",
//     requestor: "Acme Inc.",
//     assignedTo: "John Doe",
//     dueDate: "2023-04-15T00:00:00.000Z",
//     status: "In Progress",
//     submissionDate: "2023-03-10T00:00:00.000Z",
//     completionDate: "",
//     outcome: "",
//     createdAt: "2023-03-10T09:00:00.000Z",
//   },
//   {
//     id: "2",
//     title: "Calibration Check for Lab Equipment",
//     division: "R&D",
//     taskCategory: "Calibration",
//     productCode: "EQP-123",
//     productDescription: "Precision Calibrator Model A",
//     startDate: "2023-03-20T00:00:00.000Z",
//     comments: "Annual calibration",
//     revisedDueDate: "",
//     requestor: "Globex Corp.",
//     assignedTo: "Jane Smith",
//     dueDate: "2023-04-05T00:00:00.000Z",
//     status: "Completed",
//     submissionDate: "2023-03-18T00:00:00.000Z",
//     completionDate: "2023-04-02T00:00:00.000Z",
//     outcome: "All equipment calibrated successfully and within specifications",
//     createdAt: "2023-03-18T10:15:00.000Z",
//   },
//   {
//     id: "3",
//     title: "Material Analysis for New Product",
//     division: "Manufacturing",
//     taskCategory: "Analysis",
//     productCode: "MAT-456",
//     productDescription: "Advanced Material Composite Sample",
//     startDate: "2023-03-25T00:00:00.000Z",
//     comments: "Urgent analysis needed",
//     revisedDueDate: "2023-03-28T00:00:00.000Z",
//     requestor: "Initech",
//     assignedTo: "Bob Johnson",
//     dueDate: "2023-04-10T00:00:00.000Z",
//     status: "In Progress",
//     submissionDate: "2023-03-22T00:00:00.000Z",
//     completionDate: "",
//     outcome: "",
//     createdAt: "2023-03-22T08:30:00.000Z",
//   },
// ]

// 👇 put this at the top of your file
const loadJobsFromSupabase = async (): Promise<Job[]> => {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      job_status(*),
      production_plant(*),
      quality_lab_task_category(*),
      profiles(*),
      requestor(*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};


 export const fetchJobs = async (): Promise<Job[]> => {
  console.log('FETCHING JOB DATA FROM Supabase')
  const { data, error } = await supabase
  .from("jobs")
  .select(`
    *,
    profiles(id, first_name, last_name, email),
    job_status(id, description),
    production_plant(id, name),
    requestor (id, name),
    quality_lab_task_category(id, description)
  `)
  .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const createJob = async (job: Omit<Job, "id" | "created_at">) => {
  // Ensure the job object doesn't include the id field
   // ✅ Remove id if it somehow exists
   const { id, created_at, ...jobWithoutId } = job as Job;

   const { data, error } = await supabase
     .from("jobs")
     .insert([jobWithoutId])
     .select(); // optional: returns inserted row

   //  useJobs();
     console.log('Job created is:', jobWithoutId)

     
   if (error) throw error;
   return data;
};

export const updateJob = async (job: Job) => {
  // const { data, error } = await supabase
  //   .from("jobs")
  //   .update({
  //     title: job.title,
  //     requestor_id: job.requestor_id,
  //     division_id: job.division_id,
  //     task_category_id: job.task_category_id,
  //     assigned_to: job.assigned_to,
  //     product_code: job.product_code,
  //     product_description: job.product_description,
  //     submission_date: job.submission_date,
  //     start_date: job.start_date,
  //     due_date: job.due_date,
  //     revised_due_date: job.revised_due_date,
  //     completion_date: job.completion_date,
  //     status_id: job.status_id,
  //     comments: job.comments,
  //     outcome: job.outcome,
  //   })
  //   .eq("id", job.id);

  // if (error) throw error;
  // return data;

  const updatePayload = {
    title: job.title,
    division_id: job.division_id,
    task_category_id: job.task_category_id,
    assigned_to: job.assigned_to,
    requestor_id: job.requestor_id,
    product_code: job.product_code,
    product_description: job.product_description,
    submission_date: job.submission_date,
    start_date: job.start_date,
    due_date: job.due_date,
    revised_due_date: job.revised_due_date,
    completion_date: job.completion_date,
    status_id: job.status_id,
    comments: job.comments,
    outcome: job.outcome,
  };

  console.log("🔧 Attempting to update job:");
  console.log("➡️ Job ID:", job.id);
  console.log("📦 Payload being sent to Supabase:", updatePayload);

  const { data, error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", job.id);

  if (error) {
    console.error("❌ Supabase update error:", error);
    throw error;
  }
  console.log("Trying to refresh the Job table data........", data);
  //useJobs();
  console.log("✅ Job updated successfully:", data);
};

export const deleteJob = async (id: string) => {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
};

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
// const { addAuditRecord } = useAudit();

  // ✅ Define loadJobs OUTSIDE useEffect so we can reuse it
  const refreshJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          job_status (*),
          production_plant (*),
          quality_lab_task_category (*),
          profiles (*),
          requestor (*)
        `)
        .order("created_at", { ascending: false });
  
      if (error) throw error;
  
      setJobs(data || []);
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };
  

  // Run once on mount
  useEffect(() => {
    refreshJobs();
  }, []);

  return {
    jobs,
    loading,
    createJob,
    updateJob,
    deleteJob,
    refreshJobs, // ✅ expose the internal refresh
    fetchJobs: loadJobsFromSupabase,
  };
}


