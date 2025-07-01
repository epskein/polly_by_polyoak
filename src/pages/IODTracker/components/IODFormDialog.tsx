import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { IODForm } from "./IODForm"
import type { IODIncident } from "../types/iod"
import { Button } from "../../../components/ui/button/Button"
import { useState } from "react"

interface IODFormDialogProps {
  incident?: IODIncident
  children: React.ReactNode
}

export function IODFormDialog({ incident, children }: IODFormDialogProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {incident ? "Edit IOD Incident" : "Create New IOD Incident"}
          </DialogTitle>
          <DialogDescription>
            {incident
              ? "Update the details of the IOD incident."
              : "Fill in the form to create a new IOD incident."}
          </DialogDescription>
        </DialogHeader>
        <IODForm incident={incident} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
} 