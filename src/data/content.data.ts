/**
 * SANO LUNA — Packages, Testimonials, Team, FAQ, Gallery Data
 *
 * IMPORTANT: Development seed data only.
 * All descriptions are original SANO LUNA copy.
 * Testimonials marked is_placeholder=true are NOT real reviews.
 * Team members marked is_placeholder=true are NOT real people.
 */

import type { Package, Testimonial, TeamMember, FAQ, BrandPrinciple, HowItWorksStep } from './types'

// ─────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────

export const packages: Package[] = [
  {
    id: 'duo-massage',
    slug: 'duo-massage',
    name_ar: 'تجربة الثنائي',
    name_en: 'Duo Experience',
    description_ar: 'شاركي من تحبين لحظة استثنائية — جلستا مساج متتاليتان في زيارة واحدة لتجربة مشتركة من الهدوء والرفاهية.',
    description_en: 'Share an exceptional moment with someone you love — two consecutive massage sessions in one visit for a shared experience of calm and luxury.',
    tagline_ar: 'لكِ ولمن تحبين',
    tagline_en: 'For you and someone you love',
    total_duration_minutes: 120,
    price_sar: 270,
    max_guests: 2,
    image_url: '/images/packages/duo-massage.jpg',
    included_services_ar: ['مساج كامل الجسم لشخصين', 'أخصائية متخصصة', 'مستلزمات عناية كاملة'],
    included_services_en: ['Full body massage for 2', 'Specialist therapist', 'Complete care essentials'],
    is_featured: true,
    is_active: true,
    sort_order: 10,
  },
  {
    id: 'hands-feet-massage',
    slug: 'hands-feet-massage',
    name_ar: 'من الأطراف إلى الأعماق',
    name_en: 'From Fingertips to Soul',
    description_ar: 'عناية متكاملة من أطراف أصابعك حتى عمق الجسم — مانيكير وبديكير ثم جلسة مساج تُكمل تجربتك بالهدوء والراحة.',
    description_en: 'Complete care from your fingertips to the depths of the body — manicure and pedicure followed by a massage session to complete your experience with calm.',
    tagline_ar: 'عناية شاملة في زيارة واحدة',
    tagline_en: 'Complete care in a single visit',
    total_duration_minutes: 120,
    price_sar: 319,
    max_guests: 1,
    image_url: '/images/packages/hands-feet-massage.jpg',
    included_services_ar: ['مانيكير وبديكير احترافي', 'مساج كامل الجسم (٦٠ دقيقة)'],
    included_services_en: ['Professional manicure & pedicure', 'Full body massage (60 min)'],
    is_featured: true,
    is_active: true,
    sort_order: 20,
  },
  {
    id: 'moroccan-massage',
    slug: 'moroccan-massage',
    name_ar: 'طقس المغرب والسكينة',
    name_en: 'Moroccan & Serenity Ritual',
    description_ar: 'رحلة من التنقية إلى الاسترخاء — الحمام المغربي يجدد البشرة والمساج يمنح الجسم والروح هدوءاً عميقاً.',
    description_en: 'A journey from purification to relaxation — the Moroccan bath renews the skin while the massage brings deep calm to body and spirit.',
    tagline_ar: 'الأصالة والرفاهية في لقاء واحد',
    tagline_en: 'Heritage and luxury in one encounter',
    total_duration_minutes: 120,
    price_sar: 319,
    max_guests: 1,
    image_url: '/images/packages/moroccan-massage.jpg',
    included_services_ar: ['الحمام المغربي الكامل', 'مساج كامل الجسم (٦٠ دقيقة)'],
    included_services_en: ['Full Moroccan bath ritual', 'Full body massage (60 min)'],
    is_featured: true,
    is_active: true,
    sort_order: 30,
  },
  {
    id: 'hands-feet-moroccan',
    slug: 'hands-feet-moroccan',
    name_ar: 'الأناقة الكاملة',
    name_en: 'Complete Elegance',
    description_ar: 'الحمام المغربي الأصيل مع عناية احترافية بالأظافر — تجربة تنقية وتجميل في زيارة واحدة متكاملة.',
    description_en: 'Authentic Moroccan bath with professional nail care — a purifying and beautifying experience in one complete visit.',
    total_duration_minutes: 150,
    price_sar: 349,
    max_guests: 1,
    image_url: '/images/packages/hands-feet-moroccan.jpg',
    included_services_ar: ['الحمام المغربي الكامل', 'مانيكير وبديكير احترافي'],
    included_services_en: ['Full Moroccan bath ritual', 'Professional manicure & pedicure'],
    is_featured: false,
    is_active: true,
    sort_order: 40,
  },
  {
    id: 'complete-ritual',
    slug: 'complete-ritual',
    name_ar: 'طقس سانو لونا الكامل',
    name_en: 'The SANO LUNA Ritual',
    description_ar: 'تجربتنا الأكثر اكتمالاً — الحمام المغربي، المانيكير والبديكير، والمساج. ثلاث ساعات من العناية الحقيقية.',
    description_en: 'Our most complete experience — Moroccan bath, manicure and pedicure, and full massage. Three hours of authentic care and complete renewal.',
    tagline_ar: 'ثلاث ساعات من التجديد الكامل',
    tagline_en: 'Three hours of complete renewal',
    total_duration_minutes: 180,
    price_sar: 449,
    max_guests: 1,
    image_url: '/images/packages/complete-ritual.jpg',
    included_services_ar: ['الحمام المغربي الكامل', 'مانيكير وبديكير احترافي', 'مساج كامل الجسم (٦٠ دقيقة)'],
    included_services_en: ['Full Moroccan bath ritual', 'Professional manicure & pedicure', 'Full body massage (60 min)'],
    is_featured: true,
    is_active: true,
    sort_order: 50,
  },
]

export const featuredPackages = packages.filter((p) => p.is_featured && p.is_active)

// ─────────────────────────────────────────────
// TESTIMONIALS — Development Placeholders
// @placeholder — NOT real reviews
// ─────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    author_name: 'م. السيف',
    author_initial: 'م',
    rating: 5,
    review_ar: 'تجربة لا تُقدّر. الاحترافية والهدوء والاهتمام بكل تفصيل جعلا من هذه الزيارة لحظة حقيقية من التجديد.',
    review_en: 'An experience beyond measure. The professionalism, calm, and attention to every detail made this visit a genuine moment of renewal.',
    service_name_ar: 'مساج الأحجار الساخنة',
    service_name_en: 'Hot Stone Massage',
    is_featured: true,
    is_placeholder: true,
  },
  {
    id: 'testimonial-2',
    author_name: 'ن. العتيبي',
    author_initial: 'ن',
    rating: 5,
    review_ar: 'الحمام المغربي كان تجربة لا أصفها إلا بالفاخرة. شعرت وكأنني في منتجع، وأنا في بيتي.',
    review_en: 'The Moroccan bath ritual was nothing short of luxurious. I felt as though I was at a destination spa — from the comfort of my own home.',
    service_name_ar: 'طقس المغرب والسكينة',
    service_name_en: 'Moroccan & Serenity Ritual',
    is_featured: true,
    is_placeholder: true,
  },
  {
    id: 'testimonial-3',
    author_name: 'ر. الشهري',
    author_initial: 'ر',
    rating: 5,
    review_ar: 'من أفضل قرارات العناية بالنفس اتخذتُها. الأخصائية كانت محترفة تماماً والنتيجة أكثر مما توقعت.',
    review_en: 'One of the best self-care decisions I\'ve made. The specialist was completely professional and the results exceeded every expectation.',
    service_name_ar: 'اللمفاوي وكاسات الهواء',
    service_name_en: 'Lymphatic & Cupping',
    is_featured: true,
    is_placeholder: true,
  },
  {
    id: 'testimonial-4',
    author_name: 'د. القحطاني',
    author_initial: 'د',
    rating: 5,
    review_ar: 'طقس سانو لونا الكامل كان هدية حقيقية لنفسي. ثلاث ساعات من الهدوء والعناية الكاملة.',
    review_en: 'The complete SANO LUNA ritual was a true gift to myself. Three hours of calm and complete care.',
    service_name_ar: 'طقس سانو لونا الكامل',
    service_name_en: 'The SANO LUNA Ritual',
    is_featured: true,
    is_placeholder: true,
  },
]

export const featuredTestimonials = testimonials.filter((t) => t.is_featured)

// ─────────────────────────────────────────────
// TEAM MEMBERS — Placeholder
// @placeholder — NOT real people
// ─────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name_ar: 'سارة',
    name_en: 'Sarah',
    title_ar: 'أخصائية مساج معتمدة',
    title_en: 'Certified Massage Specialist',
    bio_ar: 'خبرة أكثر من خمس سنوات في علاجات المساج التقليدية والحديثة.',
    bio_en: 'More than five years of experience in traditional and contemporary massage therapies.',
    image_url: '/images/team/therapist-1.jpg',
    specialties_ar: ['المساج السويدي', 'الأحجار الساخنة', 'مساج الحامل'],
    specialties_en: ['Swedish Massage', 'Hot Stone', 'Prenatal Massage'],
    is_featured: true,
    is_placeholder: true,
    sort_order: 1,
  },
  {
    id: 'team-2',
    name_ar: 'نورة',
    name_en: 'Noura',
    title_ar: 'أخصائية الحمام المغربي',
    title_en: 'Moroccan Bath Specialist',
    bio_ar: 'متخصصة في طقوس الحمام المغربي الأصيلة والعناية بالبشرة.',
    bio_en: 'Specialist in authentic Moroccan bath rituals and skin care.',
    image_url: '/images/team/therapist-2.jpg',
    specialties_ar: ['الحمام المغربي', 'العناية بالبشرة', 'الطقوس التراثية'],
    specialties_en: ['Moroccan Bath', 'Skin Care', 'Heritage Rituals'],
    is_featured: true,
    is_placeholder: true,
    sort_order: 2,
  },
  {
    id: 'team-3',
    name_ar: 'رنا',
    name_en: 'Rana',
    title_ar: 'أخصائية العلاجات المتخصصة',
    title_en: 'Specialty Therapies Specialist',
    bio_ar: 'خبيرة في العلاجات المتقدمة: اللمفاوي، الكاسات، والأحجار العلاجية.',
    bio_en: 'Expert in advanced therapies: lymphatic drainage, cupping, and therapeutic stones.',
    image_url: '/images/team/therapist-3.jpg',
    specialties_ar: ['المساج اللمفاوي', 'كاسات الهواء', 'المساج العلاجي'],
    specialties_en: ['Lymphatic Drainage', 'Cupping Therapy', 'Therapeutic Massage'],
    is_featured: true,
    is_placeholder: true,
    sort_order: 3,
  },
]

export const featuredTeam = teamMembers.filter((m) => m.is_featured)

// ─────────────────────────────────────────────
// FAQ — Homepage Preview
// ─────────────────────────────────────────────

export const faqs: FAQ[] = [
  {
    id: 'faq-1',
    question_ar: 'كيف يتم حجز الموعد؟',
    question_en: 'How do I book an appointment?',
    answer_ar: 'يمكنك الحجز مباشرة عبر صفحة الحجز. اختاري الخدمة، التاريخ، والوقت المناسب وسنؤكد حجزك فور إتمام الطلب.',
    answer_en: 'You can book directly through our booking page. Choose your service, preferred date and time, and we will confirm your appointment upon completion.',
    category: 'booking',
    sort_order: 1,
  },
  {
    id: 'faq-2',
    question_ar: 'هل الخدمات متاحة في المنزل؟',
    question_en: 'Are services available at home?',
    answer_ar: 'نعم. خدمات SANO LUNA تُقدَّم مباشرة في موقعك. سيصل فريقنا إليك مع كامل مستلزمات الجلسة.',
    answer_en: 'Yes. SANO LUNA services are delivered directly to your location. Our team arrives fully equipped with all session essentials.',
    category: 'services',
    sort_order: 2,
  },
  {
    id: 'faq-3',
    question_ar: 'ما الذي يجب تحضيره قبل الجلسة؟',
    question_en: 'What should I prepare before my session?',
    answer_ar: 'لا يلزمك شيء خاص. فريقنا يحضر كل ما يلزم. نطلب فقط مساحة هادئة ومريحة في منزلك.',
    answer_en: 'Nothing special is required. Our team brings everything needed. We simply ask for a quiet, comfortable space in your home.',
    category: 'services',
    sort_order: 3,
  },
  {
    id: 'faq-4',
    question_ar: 'ما طرق الدفع المتاحة؟',
    question_en: 'What payment methods are available?',
    answer_ar: 'نقبل الدفع الإلكتروني عبر بطاقات الائتمان ومدى، إضافة إلى Apple Pay وطرق الدفع الرقمية الأخرى.',
    answer_en: 'We accept electronic payment via credit cards, Mada, Apple Pay, and other digital payment methods.',
    category: 'payment',
    sort_order: 4,
  },
  {
    id: 'faq-5',
    question_ar: 'هل يمكن إلغاء أو تغيير الموعد؟',
    question_en: 'Can I cancel or reschedule my appointment?',
    answer_ar: 'نعم. يمكن الإلغاء أو التغيير قبل الموعد بفترة كافية. راجع سياسة الإلغاء الخاصة بنا للتفاصيل الكاملة.',
    answer_en: 'Yes. Cancellation or rescheduling is possible with sufficient notice before your appointment. Please review our cancellation policy for full details.',
    category: 'booking',
    sort_order: 5,
  },
  {
    id: 'faq-6',
    question_ar: 'هل خدمات الحامل آمنة؟',
    question_en: 'Are prenatal services safe?',
    answer_ar: 'خدمات الحامل مصممة بعناية مع مراعاة المتطلبات الصحية. ننصح دائماً بمراجعة طبيبك قبل حجز أي خدمة خلال فترة الحمل.',
    answer_en: 'Prenatal services are carefully designed with health considerations in mind. We always recommend consulting your physician before booking any service during pregnancy.',
    category: 'services',
    sort_order: 6,
  },
]

export const homepageFaqs = faqs.slice(0, 4)

// ─────────────────────────────────────────────
// BRAND PRINCIPLES — Why SANO LUNA
// ─────────────────────────────────────────────

export const brandPrinciples: BrandPrinciple[] = [
  {
    id: 'privacy',
    icon: '◇',
    title_ar: 'خصوصية تامة',
    title_en: 'Complete Privacy',
    description_ar: 'تجربتك في فضائك الخاص، بعيداً عن الأعين — خصوصيتك هي أولويتنا الأولى.',
    description_en: 'Your experience in your own space, away from the outside world — your privacy is our first priority.',
  },
  {
    id: 'expertise',
    icon: '✦',
    title_ar: 'احترافية موثوقة',
    title_en: 'Trusted Expertise',
    description_ar: 'أخصائيات معتمدات ومؤهلات — كل جلسة تُنفَّذ بمعايير العناية الاحترافية الأعلى.',
    description_en: 'Certified and qualified specialists — every session delivered to the highest professional care standards.',
  },
  {
    id: 'personalised',
    icon: '◌',
    title_ar: 'عناية شخصية',
    title_en: 'Personalised Care',
    description_ar: 'نستمع إلى احتياجاتك ونُكيّف كل جلسة لتناسب جسمك وتفضيلاتك بشكل شخصي.',
    description_en: 'We listen to your needs and tailor every session to suit your body and preferences personally.',
  },
  {
    id: 'quality',
    icon: '⌘',
    title_ar: 'جودة لا تُساوَم عليها',
    title_en: 'Uncompromising Quality',
    description_ar: 'منتجات عناية مختارة، أدوات معقمة، ومعايير نظافة صارمة في كل زيارة.',
    description_en: 'Selected care products, sanitised tools, and strict hygiene standards in every visit.',
  },
]

// ─────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    icon: '◌',
    title_ar: 'اختاري تجربتك',
    title_en: 'Choose Your Experience',
    description_ar: 'تصفحي خدماتنا واختاري ما يناسب حاجتك — من الاسترخاء البسيط إلى الباقات المتكاملة.',
    description_en: 'Browse our services and choose what suits your needs — from simple relaxation to complete combined journeys.',
  },
  {
    step: 2,
    icon: '◇',
    title_ar: 'حددي الموعد',
    title_en: 'Select Your Time',
    description_ar: 'اختاري التاريخ والوقت المناسبين. نعمل بمرونة تناسب جدولك.',
    description_en: 'Choose a date and time that suits you. We work with flexibility to fit your schedule.',
  },
  {
    step: 3,
    icon: '✦',
    title_ar: 'أكملي الحجز',
    title_en: 'Confirm Your Booking',
    description_ar: 'أكملي بياناتك وادفعي بأمان. ستصلك تأكيد الحجز فوراً.',
    description_en: 'Complete your details and pay securely. Instant booking confirmation delivered to you.',
  },
  {
    step: 4,
    icon: '✧',
    title_ar: 'استمتعي بـ SANO LUNA',
    title_en: 'Experience SANO LUNA',
    description_ar: 'أخصائيتنا تصل إليك مع كامل مستلزمات الجلسة. فقط استرخي واستمتعي.',
    description_en: 'Your specialist arrives with everything needed. Simply relax and let SANO LUNA take care of the rest.',
  },
]
