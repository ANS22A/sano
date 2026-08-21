import { CustomerAuthForm } from '@/components/auth/CustomerAuthForm'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default async function CustomerLoginPage(props: LoginPageProps) {
  const params = await props.params
  return <CustomerAuthForm type="login" locale={params.locale} />
}
