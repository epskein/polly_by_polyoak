"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  ChevronDown,
  Edit,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { Button } from "../../../components/ui/button/Button"
import { Dropdown } from "../../../components/ui/dropdown/Dropdown"
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem"
import { Input } from "../../../components/ui/input/Input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import type { Job } from "../types/job"
import Badge from "../../../components/ui/badge/Badge"
import { format, isPast } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/form/Select"

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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRefs: Record<string, HTMLDivElement | null> = {}

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openRef = openDropdownId ? dropdownRefs[openDropdownId] : null
      if (openRef && !openRef.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openDropdownId])

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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

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
        const aName = `${a.profiles?.first_name ?? ""} ${a.profiles?.last_name ?? ""}`.toLowerCase()
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Backlog">Backlog</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select onValueChange={(value) => setAssigneeFilter(value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.value} value={assignee.label}>
                  {assignee.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "40px" }}>
                <span className="sr-only">Expand</span>
              </TableHead>
              <TableHead>Task Title</TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("created_at")}>
                  Created Date
                  {sortField === "created_at" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("due_date")}>
                  Due Date
                  {sortField === "due_date" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("assigned_to")}
                >
                  Assigned To
                  {sortField === "assigned_to" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("job_status")}>
                  Status
                  {sortField === "job_status" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </TableHead>
              <TableHead style={{ width: "60px" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <React.Fragment key={job.id}>
                  <TableRow>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => toggleRowExpansion(job.id)} className="p-1">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedRows[job.id] ? "transform rotate-180" : ""}`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.created_at ? format(new Date(job.created_at), "MMM dd, yyyy") : "-"}</TableCell>
                    <TableCell>{job.due_date ? format(new Date(job.due_date), "MMM dd, yyyy") : "-"}</TableCell>
                    <TableCell>{job.profiles?.first_name} {job.profiles?.last_name}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === job.id ? null : job.id,
                            )
                          }
                          className="dropdown-toggle"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <Dropdown
                          isOpen={openDropdownId === job.id}
                          onClose={() => setOpenDropdownId(null)}
                        >
                          <DropdownItem
                            onClick={() => {
                              onEdit(job)
                              setOpenDropdownId(null)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              onDelete(job)
                              setOpenDropdownId(null)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows[job.id] && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-4 px-5">
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
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-100 dark:border-white/[0.05]">
        <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">{filteredJobs.length} job(s) total.</div>
      </div>
    </div>
  )
}

