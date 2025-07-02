"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { IODDataTable } from "./IODDataTable"

export function IODTableView() {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>IOD Incident Table</CardTitle>
        <CardDescription>
          Browse, search, and manage all IOD incidents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <IODDataTable />
      </CardContent>
    </Card>
  )
} 