"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button/Button"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input/Input"
import Label from "../../../components/form/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/form/Select"
import { Textarea } from "../../../components/form/input/TextArea"
import type { Job } from "../types/job"
import { supabase } from "../../../lib/supabase"
import { DatePicker } from "../../../components/form/date-picker"
import { Plus } from "lucide-react"
import { createRequestor } from "../lib/requestorService"
import { fetchRequestors } from "../lib/requestorService"
import { useJobs } from "../hooks/use-jobs"

interface JobDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (job: Job | Omit<Job, "id" | "created_at">) => void
  editJob: Job | null
}

const initialEmptyJob: Job = {
  id: null as any,
  title: "",
  division_id: null,
  task_category_id: null,
  assigned_to: null,
  product_code: "",
  product_description: "",
  submission_date: new Date(),
  start_date: new Date(),
  due_date: new Date(),
  revised_due_date: new Date(),
  completion_date: new Date(),
  status_id: null,
  comments: "",
  outcome: "",
  requestor_id: null,
  created_at: new Date().toISOString(),
}

export function JobDialog({ open, setOpen, onSubmit, editJob }: JobDialogProps) {
  const [job, setJob] = useState<Job>(initialEmptyJob)
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [divisions, setDivisions] = useState<{ value: string; label: string }[]>([])
  const [assignedToOptions, setAssignedToOptions] = useState<{ value: string; label: string }[]>([])
  const [statuses, setStatuses] = useState<{ value: string; label: string }[]>([])
  const [requestors, setRequestors] = useState<{ value: string; label: string }[]>([])
  const [requestorDialogOpen, setRequestorDialogOpen] = useState(false)
  const [newRequestorName, setNewRequestorName] = useState("")
  const [submissionDate, setSubmissionDate] = useState<Date | undefined>(new Date())
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
  const [revisedDueDate, setRevisedDueDate] = useState<Date | undefined>()
  const [completionDate, setCompletionDate] = useState<Date | undefined>()

  useEffect(() => {
    if (open) {
      if (editJob) {
        setJob({ ...editJob })
        setSubmissionDate(
          editJob.submission_date ? new Date(editJob.submission_date) : undefined,
        )
        setStartDate(editJob.start_date ? new Date(editJob.start_date) : undefined)
        setDueDate(editJob.due_date ? new Date(editJob.due_date) : undefined)
        setRevisedDueDate(
          editJob.revised_due_date
            ? new Date(editJob.revised_due_date)
            : undefined,
        )
        setCompletionDate(
          editJob.completion_date
            ? new Date(editJob.completion_date)
            : undefined,
        )
      } else {
        setJob({ ...initialEmptyJob })
      }
    }
  }, [open, editJob])

  const fetchRequestors = async () => {
    const { data, error } = await supabase.from("requestor").select("*");
  
    if (error) {
      console.error("Failed to load requestors:", error);
      return;
    }
  
    if (data) {
      const options = data.map((req) => ({ value: req.id, label: req.name }));
      setRequestors(options);
    }
  };
  
  useEffect(() => {
    fetchRequestors();
  }, []);
  
  

useEffect(() => {
  const fetchStatuses = async () => {
    const { data, error } = await supabase.from("job_status").select("*");
    if (!error && data) {
      setStatuses(data.map((status) => ({
        value: status.id,
        label: status.description,
      })));
    }
  };
  fetchStatuses();
}, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("quality_lab_task_category").select("*");
      if (!error && data) {
        setCategories(data.map((cat) => ({ value: cat.id, label: cat.description })));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDivisions = async () => {
      const { data, error } = await supabase.from("production_plant").select("*");
      if (!error && data) {
        setDivisions(data.map((div) => ({ value: div.id, label: div.name })));
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      const { data: dept, error: deptError } = await supabase.from("polyoak_department").select("id").eq("name", "SHEQ").single();
      if (deptError || !dept) return;
      const { data: users, error: userError } = await supabase.from("profiles").select("id, first_name, last_name").eq("department_id", dept.id);
      if (!userError && users) {
        setAssignedToOptions(users.map((user) => ({ value: user.id, label: `${user.first_name} ${user.last_name}` })));
      }
    };
    fetchAssignedUsers();
  }, []);

  const handleChange = (
    field: keyof Job,
    value: string | number | Date | null,
  ) => {
    setJob((prev) => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = async () => {
    try {
      if (editJob) {
        console.log("✏️ Updating job from dialog:", job);
        onSubmit(job); // send full job object back to parent
      } else {
        const { id, created_at, ...jobWithoutId } = job;
        console.log("🆕 Submitting NEW job (cleaned):", jobWithoutId);
        onSubmit(jobWithoutId as Omit<Job, "id" | "created_at">);
      }
  
      setOpen(false); // close dialog
    } catch (error) {
      console.error("❌ Error in dialog handleSubmit:", error);
    }
  };
  
  
// // ✅ fetch and map
// const fetchAndSetRequestors = async () => {
//   try {
//     const data = await fetchRequestors();
//     const options = data.map((r) => ({ value: r.id, label: r.name }));
//     setRequestors(options);
//   } catch (err) {
//     console.error("Failed to load requestors:", err);
//   }
// };

  
  const handleAddRequestor = async () => {
    if (!newRequestorName.trim()) return;
    try {
      const newRequestor = await createRequestor(newRequestorName);
      setNewRequestorName("");
      setRequestorDialogOpen(false);
      //await fetchAndSetRequestors();
      // 👇 Optionally auto-select the new one
      await fetchRequestors(); // 🔁 this is supposed to refresh the dropdown
      handleChange("requestor", newRequestor.id.toString());
    } catch (err) {
      console.error("Failed to add requestor:", err);
    }
  };
  

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editJob ? "Edit Job" : "Create New Job"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Division</Label>
                <Select
                  onValueChange={(value) => handleChange("division_id", value)}
                  value={job.division_id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Requestor</Label>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => handleChange("requestor_id", value)}
                    value={job.requestor_id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Requestor" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestors.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setRequestorDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Task Category</Label>
                <Select
                  onValueChange={(value) => handleChange("task_category_id", value)}
                  value={job.task_category_id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ value: "", label: "Select Category" }, ...categories].map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select
                  onValueChange={(value) => handleChange("assigned_to", value)}
                  value={job.assigned_to?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedToOptions.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Task Title</Label>
                <Input
                  placeholder="eg. Inspect bottle cap"
                  value={job.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
              <div>
                <Label>Product Code</Label>
                <Input
                  placeholder="eg. ACTB12345"
                  value={job.product_code}
                  onChange={(e) => handleChange("product_code", e.target.value)}
                />
              </div>
              <div>
                <Label>Product Description</Label>
                <Input
                  value={job.product_description}
                  onChange={(e) => handleChange("product_description", e.target.value)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  onValueChange={(value) => handleChange("status_id", value)}
                  value={job.status_id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ value: "", label: "Select Status" }, ...statuses].map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Comments</Label>
                {/* <Textarea
                  placeholder="Add any comments"
                  value={job.comments ?? ""}
                  onChange={(e) => handleChange("comments", e.target.value)}
                /> */}
              </div>
              <div className="md:col-span-2">
                <Label>Outcome</Label>
                {/* <Textarea
                  value={job.outcome ?? ""}
                  onChange={(e) => handleChange("outcome", e.target.value)}
                /> */}
              </div>
              <div>
                <Label>Submission Date</Label>
                <DatePicker
                  date={submissionDate}
                  setDate={(date) => {
                    setSubmissionDate(date)
                    handleChange("submission_date", date?.toISOString() ?? null)
                  }}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <DatePicker
                  date={startDate}
                  setDate={(date) => {
                    setStartDate(date)
                    handleChange("start_date", date?.toISOString() ?? null)
                  }}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <DatePicker
                  date={dueDate}
                  setDate={(date) => {
                    setDueDate(date)
                    handleChange("due_date", date?.toISOString() ?? null)
                  }}
                />
              </div>
              <div>
                <Label>Revised Due Date</Label>
                <DatePicker
                  date={revisedDueDate}
                  setDate={(date) => {
                    setRevisedDueDate(date)
                    handleChange("revised_due_date", date?.toISOString() ?? null)
                  }}
                />
              </div>
              <div>
                <Label>Completion Date</Label>
                <DatePicker
                  date={completionDate}
                  setDate={(date) => {
                    setCompletionDate(date)
                    handleChange("completion_date", date?.toISOString() ?? null)
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editJob ? "Save Changes" : "Create Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ➕ Requestor Creation Dialog */}
      <Dialog
        open={requestorDialogOpen}
        onOpenChange={setRequestorDialogOpen}
      >
        <DialogContent className="max-w-md mx-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Add New Requestor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="newRequestor">Requestor Name</Label>
              <Input
                id="newRequestor"
                value={newRequestorName}
                onChange={(e) => setNewRequestorName(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <Button
                variant="outline"
                onClick={() => setRequestorDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddRequestor}>Add Requestor</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};