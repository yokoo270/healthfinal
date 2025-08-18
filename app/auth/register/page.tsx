import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Join HealthMaxxing"
      subtitle="Start your AI-powered fitness transformation"
      footerText="Already have an account?"
      footerLink="/auth/login"
      footerLinkText="Sign in"
    >
      <RegisterForm />
    </AuthLayout>
  )
}
