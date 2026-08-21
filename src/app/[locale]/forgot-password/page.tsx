import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage(props: PageProps) {
  const params = await props.params
  return <PasswordRecoveryForm type="forgot" locale={params.locale} />
}
