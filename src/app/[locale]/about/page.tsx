import { brandPrinciples } from '@/data/content.data'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return {
    title: t('about'),
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const common = await getTranslations({ locale, namespace: 'home.intro' })

  return (
    <main className="min-h-screen pt-32 pb-16 bg-background">
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent text-sm tracking-widest uppercase mb-4">{common('overline')}</p>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-6">{t('about')}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{common('body')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {brandPrinciples.map((principle) => {
            const title = locale === 'ar' ? principle.title_ar : principle.title_en
            const desc = locale === 'ar' ? principle.description_ar : principle.description_en
            
            return (
              <div key={principle.id} className="bg-surface p-8 rounded-2xl border border-border/50 hover:border-accent transition-colors duration-300">
                <div className="text-3xl text-accent mb-4">{principle.icon}</div>
                <h3 className="text-xl font-display text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
