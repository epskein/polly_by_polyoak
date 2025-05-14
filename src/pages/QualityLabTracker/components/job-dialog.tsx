"use client"

import { useState, useEffect, SetStateAction } from "react"
import Button from "../../../components/ui/button/Button"
import { Dialog, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import Input from "../../../components/ui/input/Input"
import Label from "../../../components/form/Label"
import Select from "../../../components/form/Select" // Default import
import TextArea from "../../../components/form/input/TextArea"
import type { Job } from "../types/job"
import { supabase } from "../../../lib/supabase";
import DatePicker from "../../../components/form/date-picker";
import { Plus } from "lucide-react"
import { fetchRequestors, createRequestor } from "../lib/requestorService";
import { useJobs } from "../hooks/use-jobs"



interface JobDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (job: Job | Omit<Job, "id" | "created_at">) => void; // ✅ fix is here
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
};

export function JobDialog({ open, setOpen, onSubmit, editJob }: JobDialogProps) {
  const [job, setJob] = useState<Job>({ ...initialEmptyJob });
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [divisions, setDivisions] = useState<{ value: string; label: string }[]>([]);
  const [assignedToOptions, setAssignedToOptions] = useState<{ value: string; label: string }[]>([]);
  const [statuses, setStatuses] = useState<{ value: string; label: string }[]>([]);
  const [requestors, setRequestors] = useState<{ value: string; label: string }[]>([]);
  const [requestorDialogOpen, setRequestorDialogOpen] = useState(false);
  const [newRequestorName, setNewRequestorName] = useState("");
  
  useEffect(() => {
    if (open) {
      if (editJob) {
        setJob({ ...editJob });
      } else {
        setJob({ ...initialEmptyJob });
      }
    }
  }, [open, editJob]);

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

  const handleChange = (field: keyof Job, value: any) => {
    setJob((prev) => ({ ...prev, [field]: value }));
  };
  
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
    <Dialog
      isOpen={open}
      onClose={() => setOpen(false)}
      className="max-w-8xl p-0 mt-16 mx-auto rounded-xl shadow-2xl border border-gray-200 dark:border-white/10"
    >
      <div className="p-6 sm:p-0">
        <DialogHeader>
          <DialogTitle>{editJob ? "Edit Job" : "Create New Job"}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label className="mb-2 block">Division</Label>
                <Select
                  options={divisions}
                  placeholder="Select Division"
                  onChange={(value) => handleChange("division_id", value)}
                  className="w-full"
                />
              </div>
            <div>
                <Label className="mb-2 block">Requestor</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      options={requestors}
                      placeholder="Select Requestor"
                      onChange={(value) => handleChange("requestor_id", value)}
                      className="w-full"
                    />
                  </div>
                  <Button  variant="outline"  onClick={() => setRequestorDialogOpen(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Task Category</Label>
                <Select
                  options={[{ value: "", label: "Select Category" }, ...categories]}
                  placeholder="Select Category"
                  onChange={(value) => handleChange("task_category_id", value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="mb-2 block">Assigned To</Label>
                <Select
                  options={assignedToOptions}
                  placeholder="Select user"
                  onChange={(value) => handleChange("assigned_to", value)}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block">Task Title</Label>
                <Input placeholder="eg. Inspect bottle cap" value={job.title} onChange={(e: { target: { value: any } }) => handleChange("title", e.target.value)} className="w-full" />
              </div>
              <div>
                <Label className="mb-2 block">Product Code</Label>
                <Input
                  value={job.product_code}
                  placeholder="eg. ACTB12345" 
                  onChange={(e: { target: { value: any } }) => handleChange("product_code", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="mb-2 block">Product Description</Label>
                <Input
                  value={job.product_description}
                  onChange={(e: { target: { value: any } }) => handleChange("product_description", e.target.value)}
                  className="w-full"
                />
              </div>
              <DatePicker id="submissionDate" label="Submission Date" placeholder="Select a date" value={job.submission_date} onChange={(dates) => handleChange("submission_date", dates[0])} />
              <DatePicker id="startDate" label="Start Date" placeholder="Select a date" value={job.start_date} onChange={(dates) => handleChange("start_date", dates[0])} />
              <DatePicker id="dueDate" label="Due Date" value={job.due_date} onChange={(dates) => handleChange("due_date", dates[0])} />
              <DatePicker id="revisedDueDate" label="Revised Due Date" placeholder="Select a date" value={job.revised_due_date} onChange={(dates) => handleChange("revised_due_date", dates[0])} />
              <DatePicker id="completionDate" label="Completion Date" placeholder="Select a date" value={job.completion_date} onChange={(dates) => handleChange("completion_date", dates[0])} />
              <div>
                <Label className="mb-2 block">Status</Label>
                <Select
  options={[{ value: "", label: "Select Status" }, ...statuses]}
  placeholder="Select Status"
  onChange={(value) => handleChange("status_id", value)}
  className="w-full"
/>
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block">Comments</Label>
                <TextArea value={job.comments} onChange={(value) => handleChange("comments", value)} className="w-full min-h-[100px]" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block">Outcome</Label>
                <TextArea value={job.outcome} onChange={(value) => handleChange("outcome", value)} className="w-full min-h-[100px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/30 rounded-b-xl">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{editJob ? "Save Changes" : "Create Job"}</Button>
        </div>
      </div>
     {/* ➕ Requestor Creation Dialog */}
     <Dialog isOpen={requestorDialogOpen} onClose={() => setRequestorDialogOpen(false)} className="max-w-md mx-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Add New Requestor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="newRequestor">Requestor Name</Label>
            <Input id="newRequestor" value={newRequestorName} onChange={(e: { target: { value: SetStateAction<string> } }) => setNewRequestorName(e.target.value)} />
          </div>
          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={() => setRequestorDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRequestor}>Save</Button>
          </div>
        </div>
      </Dialog>
    </Dialog>
  );
};