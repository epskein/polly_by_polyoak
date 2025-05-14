import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
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
