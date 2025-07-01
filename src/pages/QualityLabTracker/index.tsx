"use client"

import { useState, useEffect } from "react"
import { JobsTable } from "./components/jobs-table"
import { AuditTable } from "./components/audit-table"
import { Analytics } from "./components/analytics"
import { JobDialog } from "./components/job-dialog"
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog"
import { Button } from "../../components/ui/button/Button"
import { PlusCircle, RefreshCcw } from "lucide-react"
import { useJobs } from "./hooks/use-jobs"
import { addAuditRecord } from "./hooks/use-audit" // or wherever your Supabase audit functions are
import type { Job } from "./types/job"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import ComponentCard from "../../components/common/ComponentCard"
import type { AuditRecord } from "./types/audit" // adjust the path if needed
import { fetchAllAuditLogs } from "./hooks/use-audit"



export default function QualityLabTracker() {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const { jobs, createJob, updateJob, deleteJob, refreshJobs, fetchJobs } = useJobs()
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([])


  // Reset editing job when dialog closes
  useEffect(() => {
    if (!open) {
      setEditingJob(null)
    }
  }, [open])

  const handleCreateNewJob = () => {
    setEditingJob(null)
    setOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setOpen(true)
  }

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      console.log("🗑️ Deleting job:", jobToDelete.id);

      // 🧠 Wait for Supabase to actually delete the job
      await deleteJob(jobToDelete.id);

      // ✅ Add audit log
      addAuditRecord({
        job_id: jobToDelete.id,
        action: "Delete",
        user_name: "ADD USER LINK HERE (delete)",
        details: `Deleted job: ${jobToDelete.title}`,
      });

      // ✅ Refresh the jobs table
      await refreshJobs(); // ✅ safe and valid now();
      await fetchAllAuditLogs();
      
      // ✅ Close the dialog
      setJobToDelete(null);
      setDeleteDialogOpen(false);

    } catch (err) {
      console.error("❌ Error deleting job:", err);
    }
  };

  const handleSubmitJob = async (
    job: Job | Omit<Job, "id" | "created_at">,
  ) => {
    try {
      if (editingJob && "id" in job) {
        console.log("✏️ Updating job:", job.id)
        updateJob(job)

        addAuditRecord({
          job_id: job.id,
          action: "Update",
          user_name: "ADD USER LINK HERE (update)",
          details: `Updated job: ${job.title}`,
        })
      } else if (!editingJob) {
        const newJob = job as Omit<Job, "id" | "created_at">
        console.log("🆕 Creating job:", newJob.title)
        const createdJobs = await createJob(newJob)

        if (createdJobs && createdJobs.length > 0) {
          const createdJob = createdJobs[0]
          addAuditRecord({
            job_id: createdJob.id,
            action: "Create",
            user_name: "ADD USER LINK HERE (create)",
            details: `Created job: ${createdJob.title}`,
          })
        }
      }

      // ✅ Refresh the jobs table
      await refreshJobs() // ✅ safe and valid now();
      await fetchAllAuditLogs()
      setOpen(false) // ✅ close dialog
      setEditingJob(null) // ✅ reset form state

      console.log("✅ Table refreshed after submit")
    } catch (error) {
      console.error("❌ Error in handleSubmitJob (index):", error)
    }
  }

  // Create tabs manually since we don't have a direct equivalent
  const [activeTab, setActiveTab] = useState("jobs")

  useEffect(() => {
    if (activeTab === "jobs") {
      refreshJobs(); // ✅ Refresh Jobs
    }
  
    if (activeTab === "audit") {
      fetchAllAuditLogs(); // ✅ Refresh Audit Log
    }
  
    // Optional: add other tabs as needed
  }, [activeTab]);
  

  useEffect(() => {
    const loadAuditRecords = async () => {
      const data = await fetchAllAuditLogs();
      console.log("📦 Audit logs:", data); // ✅ see if anything is returned
      setAuditRecords(data);
    };

    loadAuditRecords();
  }, []);

  

  return (
    <>
      <PageBreadcrumb pageTitle="Quality Lab Job Tracker" />

      <div className="bg-white border rounded-lg shadow-sm p-4">
        {/* Custom tabs implementation */}
        <div className="w-full mb-8">
          <div className="grid w-full grid-cols-3 gap-2 rounded-md bg-muted p-1">
            <button
              className={`rounded-sm px-3 py-1.5 text-sm ${activeTab === "jobs"
                  ? "bg-blue-600 text-white font-bold shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => setActiveTab("jobs")}
            >
              Jobs
            </button>
            <button
              className={`rounded-sm px-3 py-1.5 text-sm ${activeTab === "audit"
                  ? "bg-blue-600 text-white font-bold shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => setActiveTab("audit")}
            >
              Audit Log
            </button>
            <button
              className={`rounded-sm px-3 py-1.5 text-sm ${activeTab === "analytics"
                  ? "bg-blue-600 text-white font-bold shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>
        </div>


        {/* Tab content */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Job List</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={refreshJobs}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button onClick={handleCreateNewJob}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Job
                </Button>
              </div>
            </div>
            <JobsTable jobs={jobs} onEdit={handleEditJob} onDelete={handleDeleteJob} />
            <JobDialog open={open} setOpen={setOpen} onSubmit={handleSubmitJob} editJob={editingJob} />
            <DeleteConfirmDialog
              open={deleteDialogOpen}
              setOpen={setDeleteDialogOpen}
              onConfirm={confirmDelete}
              jobTitle={jobToDelete?.title || ""}
            />
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Audit Log</h2>
            <AuditTable auditRecords={auditRecords} />

          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
            <Analytics jobs={jobs} />
          </div>
        )}
      </div>
    </>
  )
}

