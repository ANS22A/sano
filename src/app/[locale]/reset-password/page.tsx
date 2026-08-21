import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ResetPasswordPage(props: PageProps) {
  const params = await props.params
  return <PasswordRecoveryForm type="reset" locale={params.locale} />
}
