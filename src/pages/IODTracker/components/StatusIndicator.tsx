import { cn } from "../../../lib/utils"

const statusColors = {
  NEW: "bg-blue-500",
  "UNDER REVIEW": "bg-yellow-500",
  "INVESTIGATION DONE - ACTION REQUIRED": "bg-orange-500",
  "INVESTIGATION NOT DONE": "bg-gray-500",
  "RE-OPENED NCQR/COID": "bg-purple-500",
  COMPLETED: "bg-green-500",
}

export function StatusIndicator({ status }: { status: keyof typeof statusColors }) {
  return (
    <div
      className={cn("h-4 w-4 rounded-full", statusColors[status] || "bg-gray-300")}
      title={status}
    />
  )
} 