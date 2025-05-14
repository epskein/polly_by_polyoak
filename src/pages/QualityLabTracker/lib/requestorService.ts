import { supabase } from "../../../lib/supabase";

// ✅ Fetch all requestors
export const fetchRequestors = async () => {
  const { data, error } = await supabase
    .from("requestor")
    .select("id, name")
    .order("name", { ascending: true });

    console.log("fetching Requestors from SUpabase)");
  if (error) throw error;
  return data;
};

// ✅ Create a new requestor
export const createRequestor = async (name: string) => {
  const { data, error } = await supabase
    .from("requestor")
    .insert([{ name }])
    .select()
    .single(); // 👈 returns the newly inserted row
    console.log("Creating Requestor to SUpabase)");
    await fetchRequestors(); // 🔁 this is supposed to refresh the dropdown
  if (error) throw error;
  return data;
};
