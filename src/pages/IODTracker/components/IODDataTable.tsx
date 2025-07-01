"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import { Button } from "../../../components/ui/button/Button"
import { ChevronUp, Eye, Edit, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { useIODData } from "../hooks/use-iod-data"
import { ReviewForm } from "./ReviewForm"
import Badge from "../../../components/ui/badge/Badge"
import { Input } from "../../../components/ui/input/Input"
import { StatusIndicator } from "./StatusIndicator"
import { EmployeeStatusForm } from "./EmployeeStatusForm"
import { IODFormDialog } from "./IODFormDialog"
import type { IODIncident } from "../types/iod"

type SortField = "employeeName" | "incidentDate" | "reviewStatus"
type SortOrder = "asc" | "desc"

export function IODDataTable() {
  const { data: incidents, isLoading, error, refetch } = useIODData()
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("incidentDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [refetch])

  if (isLoading) return <div>Loading incidents...</div>
  if (error) return <div>Error loading incidents: {error.message}</div>
  if (!incidents || incidents.length === 0) return <div>No incidents found.</div>

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleStatusUpdate = () => {
    refetch()
  }

  const filteredIncidents = incidents
    .filter((incident: IODIncident) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        incident.employeeName.toLowerCase().includes(searchLower) ||
        incident.department.toLowerCase().includes(searchLower) ||
        incident.division.toLowerCase().includes(searchLower) ||
        incident.injuredBodyPart.toLowerCase().includes(searchLower) ||
        incident.injuryDetails.toLowerCase().includes(searchLower) ||
        (incident.review?.reviewStatus || "NEW").toLowerCase().includes(searchLower)
      )
    })
    .sort((a: IODIncident, b: IODIncident) => {
      if (sortField === "employeeName") {
        return sortOrder === "asc"
          ? a.employeeName.localeCompare(b.employeeName)
          : b.employeeName.localeCompare(a.employeeName)
      } else if (sortField === "incidentDate") {
        return sortOrder === "asc"
          ? new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime()
          : new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime()
      } else if (sortField === "reviewStatus") {
        const statusA = a.review?.reviewStatus || "NEW"
        const statusB = b.review?.reviewStatus || "NEW"
        return sortOrder === "asc"
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA)
      }
      return 0
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <IODFormDialog>
          <Button>Create New IOD</Button>
        </IODFormDialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("employeeName")}
              >
                Employee Name
                <SortIcon field="employeeName" />
              </TableHead>
              <TableHead>NCQR No.</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Incident No.</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("incidentDate")}
              >
                Incident Date
                <SortIcon field="incidentDate" />
              </TableHead>
              <TableHead>Injured Body Part</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("reviewStatus")}
              >
                Status
                <SortIcon field="reviewStatus" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.map((incident: IODIncident) => (
              <React.Fragment key={incident.id}>
                <TableRow>
                  <TableCell className="p-2 text-center">
                    <StatusIndicator status={incident.review?.reviewStatus || "NEW"} />
                  </TableCell>
                  <TableCell className="font-medium">{incident.employeeName}</TableCell>
                  <TableCell>{incident.ncqrNo}</TableCell>
                  <TableCell>{incident.department}</TableCell>
                  <TableCell>{incident.division}</TableCell>
                  <TableCell>{incident.incidentNo}</TableCell>
                  <TableCell>
                    {format(new Date(incident.incidentDate), "PPP")}
                  </TableCell>
                  <TableCell>{incident.injuredBodyPart}</TableCell>
                  <TableCell>
                    <Badge color="primary">
                      {incident.review?.reviewStatus || "NEW"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <IODFormDialog incident={incident}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </IODFormDialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRow(incident.id)}
                      >
                        {expandedRows[incident.id] ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRows[incident.id] && (
                  <TableRow>
                    <TableCell colSpan={10} className="p-0">
                      <div className="bg-muted p-4">
                        <h3 className="text-lg font-semibold mb-4">
                          Incident Details: {incident.employeeName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h4 className="font-medium mb-2">Injury Details:</h4>
                            <p className="text-sm text-muted-foreground bg-background p-3 rounded-md">
                              {incident.injuryDetails}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Employee Status:</h4>
                            <div className="bg-background p-3 rounded-md space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Employee Booked Off:
                                </span>
                                <Badge color={incident.employeeBookedOff ? "warning" : "primary"}>
                                  {incident.employeeBookedOff ? "YES" : "NO"}
                                </Badge>
                              </div>
                              <EmployeeStatusForm
                                incidentId={incident.id}
                                incidentDate={incident.incidentDate}
                                employeeBookedOff={incident.employeeBookedOff}
                                returnToWorkDate={incident.returnToWorkDate}
                                daysBookedOff={incident.daysBookedOff}
                                onSuccess={handleStatusUpdate}
                              />
                            </div>
                          </div>
                        </div>
                        <ReviewForm
                          incidentId={incident.id}
                          existingReview={incident.review}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 