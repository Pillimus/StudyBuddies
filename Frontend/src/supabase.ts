import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yqmugkmorgjcmpupzbde.supabase.co";
const supabaseAnonKey = "sb_publishable_JFEAPFUc0h99uQBtKjjJ8g_K1ew1rAN";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);