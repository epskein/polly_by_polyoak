import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover"
import { Button } from "../../../components/ui/button/Button"
import { DatePicker } from "../../../components/form/date-picker"
import { Switch } from "../../../components/form/switch/Switch"
import Badge from "../../../components/ui/badge/Badge"
import { cn } from "../../../lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const formSchema = z.object({
  employeeBookedOff: z.boolean(),
  returnToWorkDate: z.date().optional(),
  daysBookedOff: z.number().int().optional(),
})

interface EmployeeStatusFormProps {
  incidentId: string
  incidentDate: string
  employeeBookedOff: boolean
  returnToWorkDate?: string
  daysBookedOff?: number
  onSuccess: () => void
}

export function EmployeeStatusForm({
  incidentId,
  incidentDate,
  employeeBookedOff,
  returnToWorkDate,
  daysBookedOff,
  onSuccess,
}: EmployeeStatusFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeBookedOff,
      returnToWorkDate: returnToWorkDate ? new Date(returnToWorkDate) : undefined,
      daysBookedOff,
    },
  })

  // Placeholder for the update function
  const updateEmployeeStatus = async (id: string, data: any) => {
    console.log("Updating employee status:", id, data)
    // In a real app, this would make an API call
    return { success: true }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const result = await updateEmployeeStatus(incidentId, data)
    if (result.success) {
      onSuccess()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employeeBookedOff"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormLabel>Employee Booked Off:</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="returnToWorkDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return to Work Date</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="daysBookedOff"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Days Booked Off:</FormLabel>
              {field.value !== undefined && (
                <Badge variant="light">{field.value} days</Badge>
              )}
            </FormItem>
          )}
        />
        <Button type="submit">Update Status</Button>
      </form>
    </Form>
  )
} 