import { supabase } from "../supabase";

export const googleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173"
    }
  });
};