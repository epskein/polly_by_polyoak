"use client"

import { IODDataTable } from "./IODDataTable"

export function IODTableView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">IOD Incident Table</h2>
        <p className="text-muted-foreground">
          Browse, search, and manage all IOD incidents.
        </p>
      </div>
      <IODDataTable />
    </div>
  )
} 