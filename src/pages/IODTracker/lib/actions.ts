import { db } from "./db"
import type { IODIncident } from "../types/iod"

export async function createIOD(data: Partial<IODIncident>) {
  try {
    const newIncident = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      employeeBookedOff: data.employeeBookedOff || false,
      review: {
        reviewDate: "",
        actionCompletionDate: "",
        daysToReview: 0,
        stopPress: false,
        category: "FAC",
        unsafeCondition: "act",
        reviewStatus: "NEW",
        updatedAt: new Date().toISOString(),
      },
    } as IODIncident

    db.incidents.unshift(newIncident)

    return { success: true, data: newIncident }
  } catch (error) {
    console.error("Failed to create IOD:", error)
    return { success: false, error: "Failed to create IOD" }
  }
}

export async function updateIOD(id: string, data: Partial<IODIncident>) {
  try {
    const index = db.incidents.findIndex((incident) => incident.id === id)
    if (index === -1) {
      throw new Error("Incident not found")
    }

    db.incidents[index] = {
      ...db.incidents[index],
      ...data,
    }

    return { success: true, data: db.incidents[index] }
  } catch (error) {
    console.error("Failed to update IOD:", error)
    return { success: false, error: "Failed to update IOD" }
  }
} 