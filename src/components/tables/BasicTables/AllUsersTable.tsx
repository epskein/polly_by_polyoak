import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../ui/button/Button"
import Input from "../../form/input/InputField"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alertDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../form/Select"

// Use the shared Supabase client configured with session persistence

export default function AllUsersTable() {
  // State for table data
  const [profiles, setProfiles] = useState<ProfileRecord[]>([])
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  // State for modal visibility and form
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [editingProfile, setEditingProfile] = useState<ProfileRecord | null>(null)
  const [formState, setFormState] = useState<UserFormState>(initialFormState)
  const [formError, setFormError] = useState<string>("")
  const isEditMode = useMemo(() => Boolean(editingProfile), [editingProfile])

  // Load profiles and roles on mount
  useEffect(() => {
    void Promise.all([loadProfiles(), loadRoles(), loadCurrentUserRole()])
  }, [])

  // Fetch profiles from backend
  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, phone, role, role_id, roles(name)")
    if (error) {
      console.error("Error fetching profiles:", error)
      return
    }
    setProfiles((data || []) as unknown as ProfileRecord[])
  }

  // Fetch roles for role dropdown
  async function loadRoles() {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error fetching roles:", error)
      return
    }
    setRoles((data || []) as RoleRecord[])
  }

  // Determine if the current user is an admin
  async function loadCurrentUserRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsAdmin(false)
      return
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role_id, roles(name)")
      .eq("id", user.id)
      .single()
    if (error) {
      console.warn("Failed to fetch current user role:", error)
      setIsAdmin(false)
      return
    }
    const roleName = (data as any)?.roles?.name as string | undefined
    setIsAdmin(roleName?.toLowerCase() === "admin")
  }

  // Open dialog for creating a new user
  function handleOpenCreate() {
    setEditingProfile(null)
    setFormState(initialFormState)
    setFormError("")
    setIsDialogOpen(true)
  }

  // Open dialog for editing an existing user
  function handleOpenEdit(profile: ProfileRecord) {
    setEditingProfile(profile)
    setFormState({
      email: profile.email || "",
      password: "",
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      phone: profile.phone || "",
      roleId: profile.role_id || "",
    })
    setFormError("")
    setIsDialogOpen(true)
  }

  // Basic client-side form validation for required fields
  function validateForm(state: UserFormState) {
    if (!state.email.trim()) return "Email is required"
    if (!isEditMode && !state.password.trim()) return "Password is required"
    if (!state.roleId.trim()) return "Role is required"
    return ""
  }

  // Handle submit for create/update
  async function handleSubmit() {
    const error = validateForm(formState)
    if (error) {
      setFormError(error)
      return
    }

    setFormError("")

    // Update existing profile, including email (admin-only)
    if (isEditMode && editingProfile) {
      try {
        // Admin-only: update all fields in one RPC
        if (!isAdmin) {
          setFormError("Only admins can update user details")
          return
        }

        const { error: updateErr } = await supabase.rpc('admin_update_user_profile', {
          p_user_id: editingProfile.id,
          p_email: formState.email.trim() || null,
          p_first_name: formState.firstName || null,
          p_last_name: formState.lastName || null,
          p_phone: formState.phone && formState.phone.trim() ? formState.phone.trim() : null,
          p_role_id: formState.roleId || null,
        })

        if (updateErr) {
          // fallback to strict variant if needed
          const { error: strictErr } = await supabase.rpc('admin_update_user_profile_strict', {
            p_user_id: editingProfile.id,
            p_email: formState.email.trim() || null,
            p_first_name: formState.firstName || null,
            p_last_name: formState.lastName || null,
            p_phone: formState.phone && formState.phone.trim() ? formState.phone.trim() : null,
            p_role_id: formState.roleId || null,
          })
          if (strictErr) {
            setFormError(strictErr.message || updateErr.message || "Failed to update user")
            return
          }
        }

        await loadProfiles()
        setIsDialogOpen(false)
        return
      } catch (e: any) {
        setFormError(e?.message || "Failed to update user")
        return
      }
    }

    // Create auth user + profile
    // Note: Using supabase.auth.signUp from client may require email confirmation and can affect session policies.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formState.email,
      password: formState.password,
      options: {
        data: {
          full_name: `${formState.firstName} ${formState.lastName}`.trim(),
          // Keep metadata minimal; role is enforced via profiles.role_id
        },
      },
    })

    if (signUpError) {
      setFormError(signUpError.message || "Failed to create auth user")
      return
    }

    const newUserId = signUpData.user?.id
    if (!newUserId) {
      setFormError("User was created but no user id returned")
      return
    }

    const { error: profileInsertError } = await supabase.from("profiles").insert({
      id: newUserId,
      email: formState.email,
      first_name: formState.firstName || null,
      last_name: formState.lastName || null,
      phone: formState.phone && formState.phone.trim() ? formState.phone.trim() : null,
      role_id: formState.roleId,
    })

    if (profileInsertError) {
      setFormError(profileInsertError.message || "Failed to create profile")
      return
    }

    await loadProfiles()
    setIsDialogOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-100 dark:border-white/[0.05]">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Users</h3>
        <Button size="sm" onClick={handleOpenCreate}>Add User</Button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableHead className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Full Name
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Email
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Phone Number
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Role
              </TableHead>
              <TableHead className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {profiles.map(profile => (
              <TableRow key={profile.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {profile.first_name} {profile.last_name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {profile.email || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {profile.phone || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {((profile as any)?.roles?.name) || profile.role || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(profile)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal for Create/Edit User */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditMode ? "Edit User" : "Add User"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode
                ? "Update user profile details."
                : "Create a new user account and linked profile."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">First Name</label>
                <Input
                  placeholder="First name"
                  value={formState.firstName}
                  onChange={e => setFormState(s => ({ ...s, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Last Name</label>
                <Input
                  placeholder="Last name"
                  value={formState.lastName}
                  onChange={e => setFormState(s => ({ ...s, lastName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formState.email}
                  onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                />
              </div>
              {!isEditMode && (
                <div>
                  <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Password</label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formState.password}
                    onChange={e => setFormState(s => ({ ...s, password: e.target.value }))}
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Phone</label>
                <Input
                  placeholder="Phone number"
                  value={formState.phone}
                  onChange={e => setFormState(s => ({ ...s, phone: e.target.value }))}
                />
              </div>
              <div>
                  <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Role<span className="text-error-500"> *</span></label>
                <Select
                  value={formState.roleId}
                  onValueChange={value => setFormState(s => ({ ...s, roleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-error-500">{formError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>{isEditMode ? "Save Changes" : "Create User"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---------- Local helpers and types ----------

function initialFormState(): UserFormState {
  return {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    roleId: "",
  }
}

interface ProfileRecord {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  role: string | null
  role_id: string | null
  roles?: { name: string }
}

interface RoleRecord {
  id: string
  name: string
}

interface UserFormState {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  roleId: string
}

