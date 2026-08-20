import type { Metadata } from 'next'
import Image from 'next/image'
import { getTeamMembers } from '@/services/team.service'
import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/utils/cn'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isAr = locale === 'ar'

  return {
    title: isAr ? 'فريقنا | سانو لونا' : 'Our Team | SANO LUNA',
    description: isAr 
      ? 'تعرفي على أخصائيات سانو لونا المعتمدات.' 
      : 'Meet the certified specialists of SANO LUNA.',
  }
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isAr = locale === 'ar'
  const staff = await getTeamMembers()
  const t = await getTranslations({ locale, namespace: 'home.team' })

  return (
    <main id="main-content" lang={locale}>
      {/* Hero Header */}
      <section className="bg-[var(--color-surface-warm)] pt-32 pb-16 border-b border-[var(--border-subtle)]">
        <div className="container-sl text-center">
          <p className="overline-sl mb-4">{t('overline')}</p>
          <h1 className="heading-sl-xl max-w-2xl mx-auto">{t('title')}</h1>
          <p className="text-body-muted max-w-xl mx-auto mt-6">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-sl">
        <div className="container-sl">
          {staff.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--color-text-muted)] text-lg">
                {isAr ? 'لا يوجد فريق متاح حالياً.' : 'No team members available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.map((member) => {
                const name = isAr ? member.name_ar : member.name_en
                const bio = isAr ? member.bio_ar : member.bio_en
                
                return (
                  <article
                    key={member.id}
                    className={cn(
                      'group flex flex-col items-center text-center',
                      'p-8 rounded-sm border border-[var(--border-subtle)] bg-background',
                      'transition-all duration-300',
                      'hover:border-[var(--color-sand-400)] hover:shadow-[0_8px_24px_rgba(26,23,20,0.06)]'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-32 h-32 rounded-full mb-6 flex-shrink-0 relative overflow-hidden',
                        'bg-gradient-to-br from-[var(--color-sand-200)] to-[var(--color-sand-300)]'
                      )}
                      aria-hidden="true"
                    >
                      {member.image_url ? (
                        <Image
                          src={member.image_url}
                          alt={name}
                          fill
                          sizes="128px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl text-[var(--color-sand-600)]">◌</span>
                        </div>
                      )}
                    </div>

                    <h2 className="font-display text-xl font-medium text-foreground mb-3">
                      {name}
                    </h2>
                    {bio && (
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {bio}
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}