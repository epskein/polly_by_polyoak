import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { supabase } from "../../lib/supabase";

export default function SignIn() {
  const location = useLocation();

  // If redirected from reset-password, ensure any residual session is cleared, then show a success hint
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (qs.get("reset") === "1") {
      // Force a clean auth state; ignore errors
      void supabase.auth.signOut();
    }
  }, [location.search]);
  return (
    <>
      <PageMeta
        title="POLLY Sign-In Screen"
        description="This is the SignIn for Polly - by Polyoak"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
