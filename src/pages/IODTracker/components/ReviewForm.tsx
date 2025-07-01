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
import { Button } from "../../../components/ui/button/Button"
import { DatePicker } from "../../../components/form/date-picker"
import { Switch } from "../../../components/form/switch/Switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/form/Select"
import type { IODReview } from "../types/iod"

const reviewSchema = z.object({
  reviewDate: z.date(),
  actionCompletionDate: z.date(),
  daysToReview: z.number().int(),
  stopPress: z.boolean(),
  category: z.string(),
  unsafeCondition: z.string(),
  reviewStatus: z.string(),
})

interface ReviewFormProps {
  incidentId: string
  existingReview?: IODReview
}

export function ReviewForm({ incidentId, existingReview }: ReviewFormProps) {
  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: existingReview
      ? {
          ...existingReview,
          reviewDate: new Date(existingReview.reviewDate),
          actionCompletionDate: new Date(existingReview.actionCompletionDate),
        }
      : {},
  })

  // Placeholder for the update function
  const createReview = async (id: string, data: any) => {
    console.log("Creating review:", id, data)
    // In a real app, this would make an API call
    return { success: true }
  }

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    await createReview(incidentId, data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reviewDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Date</FormLabel>
              <FormControl>
                <DatePicker date={field.value} setDate={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="actionCompletionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action Completion Date</FormLabel>
              <FormControl>
                <DatePicker date={field.value} setDate={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Other fields would go here */}
        <Button type="submit">Save Review</Button>
      </form>
    </Form>
  )
} 