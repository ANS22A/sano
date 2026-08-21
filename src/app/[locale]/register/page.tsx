import { CustomerAuthForm } from '@/components/auth/CustomerAuthForm'

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export default async function CustomerRegisterPage(props: RegisterPageProps) {
  const params = await props.params
  return <CustomerAuthForm type="register" locale={params.locale} />
}
