import { useEffect, useState } from "react"
import PageMeta from "../../components/common/PageMeta"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import ComponentCard from "../../components/common/ComponentCard"
import Input from "../../components/form/input/InputField"
import { Button } from "../../components/ui/button/Button"
import { supabase } from "../../lib/supabase"

// Simple User Role Configuration screen
// - Lists existing roles from Supabase table `roles`
// - Allows adding a new role (string name)
// - Keeps styling consistent with existing components

export default function RoleConfig() {
  // Local state for roles and form input
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [newRoleName, setNewRoleName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Load roles on mount
  useEffect(() => {
    void loadRoles()
  }, [])

  // Fetch roles from Supabase; handles and surfaces errors
  async function loadRoles() {
    setErrorMessage("")
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, created_at")
      .order("name", { ascending: true })

    if (error) {
      setErrorMessage(
        "Unable to load roles. Please ensure the 'roles' table exists and you have permission."
      )
      return
    }
    setRoles(data || [])
  }

  // Add a role to Supabase; validates input and deduplicates by name
  async function handleAddRole() {
    const trimmed = newRoleName.trim()
    if (!trimmed) return

    // Prevent duplicates on client before round-trip
    const isDuplicate = roles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      setErrorMessage("Role already exists")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")
    const { error } = await supabase
      .from("roles")
      .insert({ name: trimmed })

    if (error) {
      setErrorMessage(error.message || "Failed to add role")
      setIsSubmitting(false)
      return
    }

    setNewRoleName("")
    setIsSubmitting(false)
    await loadRoles()
  }

  return (
    <>
      <PageMeta
        title="User Role Configuration"
        description="Manage the list of roles in the system."
      />
      <PageBreadcrumb pageTitle="User Roles" />

      <div className="space-y-6">
        <ComponentCard title="Roles" desc="Add and view roles used across the application.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grow">
              <Input
                type="text"
                placeholder="Enter role name (e.g. Admin, Manager, Viewer)"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="shrink-0">
              <Button onClick={handleAddRole} disabled={!newRoleName.trim() || isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Role"}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-error-500">{errorMessage}</p>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                    <th className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Role Name
                    </th>
                    <th className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {roles.map(role => (
                    <tr key={role.id}>
                      <td className="px-5 py-3 text-theme-sm text-gray-800 dark:text-white/90">
                        {role.name}
                      </td>
                      <td className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatDate(role.created_at)}
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr>
                      <td className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400" colSpan={2}>
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  )
}

// Formats a timestamp string to a short, human-friendly date
function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString()
}

// Types used by this page
interface RoleRecord {
  id: string
  name: string
  created_at: string | null
}


