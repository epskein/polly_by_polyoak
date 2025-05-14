"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Edit, MoreHorizontal, MoreVertical, Trash2, AlertCircle } from "lucide-react"
import Button from "../../../components/ui/button/Button"
import { Dropdown } from "../../../components/ui/dropdown/Dropdown"
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem"
import Input from "../../../components/ui/input/Input"
import { Table } from "../../../components/ui/table"
import type { Job } from "../types/job"
import Badge from "../../../components/ui/badge/Badge"
import { format, isPast } from "date-fns"
import Select from "../../../components/form/Select"




interface JobsTableProps {
  jobs: Job[]
  onEdit: (job: Job) => void
  onDelete: (job: Job) => void
}



export function JobsTable({ jobs, onEdit, onDelete }: JobsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [sortField, setSortField] = useState<keyof Job>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs: Record<string, HTMLDivElement | null> = {};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openRef = openDropdownId ? dropdownRefs[openDropdownId] : null;
      if (openRef && !openRef.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);


  const toggleRowExpansion = (jobId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }))
  }

  const isOverdue = (job: Job) => {
    if (job.job_status?.description === "Completed" || !job.due_date) return false
    return isPast(new Date(job.due_date))
  }

  const handleSort = (field: keyof Job | "assigned_to") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };


  // Filter and sort jobs
  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter ? job.job_status?.description === statusFilter : true
      const matchesAssignee = assigneeFilter ? job.profiles?.first_name === assigneeFilter : true

      return matchesSearch && matchesStatus && matchesAssignee
    })
    .sort((a, b) => {
      // Custom sort for profile name
      if (sortField === "assigned_to") {
        const aName = `${a.profiles?.first_name ?? ""} ${a.profiles?.last_name ?? ""}`.toLowerCase();
        const bName = `${b.profiles?.first_name ?? ""} ${b.profiles?.last_name ?? ""}`.toLowerCase();

        return sortDirection === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      const aValue = a[sortField] ?? "";
      const bValue = b[sortField] ?? "";

      return sortDirection === "asc"
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

  // Get unique assignees for filter
  // const assignees = Array.from(new Set(jobs.map((job) => job.profiles))).filter(Boolean)
  const assignees = Array.from(
    new Set(
      jobs.map((job) => job.profiles?.id) // or `.email` if more unique
    )
  )
    .filter(Boolean)
    .map((id) => {
      const match = jobs.find((job) => job.profiles?.id === id);
      return {
        value: id,
        label: `${match?.profiles?.first_name} ${match?.profiles?.last_name}`,
      };
    });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mb-4 p-4 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by title or product code..."
            value={searchTerm}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            options={[
              { value: "", label: "All Statuses" },
              { value: "Backlog", label: "Backlog" },
              { value: "In Progress", label: "In Progress" },
              { value: "On Hold", label: "On Hold" },
              { value: "Completed", label: "Completed" },
            ]}
            placeholder="All Statuses"
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            options={[
              { value: "", label: "All Assignees" },
              ...(assignees ?? []).map((assignee) => ({
                value: assignee.label as string,
                label: (assignee.label + 'test line109') as string,
              })),
            ]}
            placeholder="All Assignees"
            onChange={(value) => setAssigneeFilter(value)}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                style={{ width: "40px" }}
              >
                <span className="sr-only">Expand</span>
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("title")}>
                  Task Title
                  {sortField === "title" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("created_at")}>
                  Created Date
                  {sortField === "created_at" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("due_date")}>
                  Due Date
                  {sortField === "due_date" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("assigned_to")}
                >
                  Assigned To
                  {sortField === "assigned_to" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>


              <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("job_status")}>
                  Status
                  {sortField === "job_status" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                style={{ width: "60px" }}
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

            {filteredJobs.length > 0 ? (

              filteredJobs.map((job) => (


                <React.Fragment key={job.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <Button variant="outline" size="sm" onClick={() => toggleRowExpansion(job.id)} className="p-1">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedRows[job.id] ? "transform rotate-180" : ""}`}
                        />
                      </Button>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-medium text-theme-sm dark:text-white/90">
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {job.created_at ? format(new Date(job.created_at), "MMM dd, yyyy") : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {job.due_date ? format(new Date(job.due_date), "MMM dd, yyyy") : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {job.profiles?.first_name} {job.profiles?.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col gap-1">
                        <Badge
                          size="sm"
                          variant="light"
                          color={
                            job.job_status?.description === "Backlog"
                              ? "primary"
                              : job.job_status?.description === "In Progress"
                                ? "warning"
                                : job.job_status?.description === "Completed"
                                  ? "success"
                                  : job.job_status?.description === "On Hold"
                                    ? "info"
                                    : "light"
                          }
                        >
                          {job.job_status?.description || "Not Set"}
                        </Badge>
                        {isOverdue(job) && (
                          <div className="flex items-center text-xs text-error-600 dark:text-error-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="relative" ref={(el) => (dropdownRefs[job.id] = el)}>
                        <Button variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setOpenDropdownId((prev) => (prev === job.id ? null : job.id))
                          }
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          <div className="w-5 h-5 flex items-center justify-center text-lg">⋮</div>
                        </Button>

                        {openDropdownId === job.id && (
                          <div className="absolute z-50 right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                            <button
                              onClick={() => {
                                onEdit(job);
                                setOpenDropdownId(null);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="mr-2 h-4 w-4 inline" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                onDelete(job);
                                setOpenDropdownId(null);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4 inline" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>


                  </tr>
                  {expandedRows[job.id] && (
                    <tr className="bg-gray-50 dark:bg-white/[0.02]">
                      <td colSpan={7} className="p-4 px-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Division</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.production_plant?.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Task Category</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.quality_lab_task_category?.description || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Product Description</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.product_description || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Product Code</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.product_code || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Start Date</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.start_date ? format(new Date(job.start_date), "MMM dd, yyyy") : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Revised Due Date</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.revised_due_date ? format(new Date(job.revised_due_date), "MMM dd, yyyy") : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Submission Date</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.submission_date ? format(new Date(job.submission_date), "MMM dd, yyyy") : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Completion Date</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.completion_date ? format(new Date(job.completion_date), "MMM dd, yyyy") : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Requestor</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.requestor?.name || "-"}</p>
                          </div>
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Comments</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.comments || "-"}</p>
                          </div>
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-white/80">Outcome</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.outcome || "-"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="h-24 text-center text-gray-500 dark:text-gray-400">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-100 dark:border-white/[0.05]">
        <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">{filteredJobs.length} job(s) total.</div>
      </div>
    </div>
  )
}

