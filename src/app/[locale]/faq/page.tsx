import { faqs } from '@/data/content.data'
import { getTranslations } from 'next-intl/server'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return {
    title: t('faq'),
  }
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const common = await getTranslations({ locale, namespace: 'home.faq' })

  return (
    <main className="min-h-screen pt-32 pb-16">
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent text-sm tracking-widest uppercase mb-4">{common('overline')}</p>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-6">{t('faq')}</h1>
          <p className="text-lg text-muted-foreground">{common('subtitle')}</p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-surface rounded-2xl p-6 md:p-10 border border-border/50">
          <Accordion className="w-full">
            {faqs.map((faq) => {
              const question = locale === 'ar' ? faq.question_ar : faq.question_en
              const answer = locale === 'ar' ? faq.answer_ar : faq.answer_en
              
              return (
                <AccordionItem key={faq.id} value={faq.id} className="border-border/50">
                  <AccordionTrigger className="text-start font-display text-lg text-foreground hover:text-accent transition-colors">
                    {question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </section>
    </main>
  )
}