"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button/Button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../../components/ui/form"
import { Input } from "../../../components/ui/input/Input"
import { Textarea } from "../../../components/form/input/TextArea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/form/Select"
import { createIOD, updateIOD } from "../lib/actions"
import { Switch } from "../../../components/form/switch/Switch"
import { DatePicker } from "../../../components/form/date-picker"
import { useIODData } from "../hooks/use-iod-data"
import { useState } from "react"
import type { IODIncident } from "../types/iod"

const departments = [
  "Operations",
  "Maintenance",
  "Administration",
  "Safety",
  "Logistics",
  "Production",
  "Quality Control",
]

const formSchema = z.object({
  employeeName: z.string().min(2, {
    message: "Employee name must be at least 2 characters.",
  }),
  ncqrNo: z.coerce.number().int().positive({
    message: "NCQR number must be a positive integer.",
  }),
  injuryDetails: z.string().min(10, {
    message: "Please provide detailed information about the injury.",
  }),
  injuredBodyPart: z.string().min(2, {
    message: "Injured body part must be specified.",
  }),
  department: z.string({
    required_error: "Please select a department.",
  }),
  division: z.string().min(2, {
    message: "Division must be at least 2 characters.",
  }),
  incidentNo: z.coerce.number().int().positive({
    message: "Incident number must be a positive integer.",
  }),
  incidentDate: z.date({
    required_error: "Incident date is required.",
  }),
  employeeBookedOff: z.boolean().default(false),
})

type IODFormProps = {
  incident?: IODIncident
  onSuccess?: () => void
}

export function IODForm({ incident, onSuccess }: IODFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refetch } = useIODData()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: incident
      ? {
          ...incident,
          incidentDate: new Date(incident.incidentDate),
        }
      : {
          employeeName: "",
          ncqrNo: undefined,
          injuryDetails: "",
          injuredBodyPart: "",
          department: "",
          division: "",
          incidentNo: undefined,
          incidentDate: new Date(),
          employeeBookedOff: false,
        },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      if (incident) {
        await updateIOD(incident.id, values)
      } else {
        await createIOD(values)
      }

      refetch()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Failed to save IOD:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ncqrNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NCQR No.</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="12345"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="division"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Division</FormLabel>
                <FormControl>
                  <Input placeholder="Engineering" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incidentNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident No.</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="54321"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incidentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Incident Date</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="injuredBodyPart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Injured Body Part</FormLabel>
                <FormControl>
                  <Input placeholder="Hand, Leg, Back, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeBookedOff"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Employee Booked Off?
                  </FormLabel>
                  <FormDescription>
                    Indicate if the employee was booked off work due to this
                    injury
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="injuryDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Injury Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed information about the injury..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Incident"}
        </Button>
      </form>
    </Form>
  )
} 