import type { Metadata } from 'next'
import { SaleForm } from '../SaleForm'

export const metadata: Metadata = {
  title: 'Record Sale / Payment | SANO LUNA Admin',
}

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const bookingId = sp.bookingId
  const bookingNumber = sp.bookingNumber
  const customerId = sp.customerId
  const customerName = sp.customerName
  const suggestedAmount = sp.amount ? parseFloat(sp.amount) : undefined

  return (
    <SaleForm
      bookingId={bookingId}
      bookingNumber={bookingNumber}
      customerId={customerId}
      customerName={customerName}
      suggestedAmount={suggestedAmount}
    />
  )
}
