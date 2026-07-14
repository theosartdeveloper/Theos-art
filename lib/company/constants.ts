/** Single source of truth for Theos Art public company details. */
export const COMPANY = {
  legalName: 'Theos Art Ltd',
  brandName: 'Theos Art',
  platformName: 'Theos Art Hub',
  slogan: 'Art that speaks',
  tagline: 'Original artworks and quality art materials in Kigali, Rwanda.',
  email: 'kubwatheosart@gmail.com',
  phone: '+250783086093',
  phoneDisplay: '+250 783 086 093',
  whatsapp: '250783086093',
  address: '342G+JX, Kigali, Rwanda',
  logoUrl: '/images/theos-art-logo-v2.png',
  region: 'East Africa',
  timezone: 'Central Africa Time (CAT, UTC+2)',
  /** Canonical public site URL used on certificates and QR codes */
  publicSiteUrl: 'https://www.theosart.com',
} as const

export const FOUNDER = {
  name: 'Theos Art Studio',
  title: 'Art & Materials',
  role: 'Creative studio',
  photo: '/hero/hero-01.png',
  headline: 'Art and materials for creators in Rwanda',
  concept:
    'Theos Art brings original artworks and trusted art materials together — so artists, collectors, and learners can create, collect, and grow in one place.',
  bio: `${COMPANY.brandName} is a Kigali-based art company focused on original works and the materials that support creative practice. From studio sessions to finished pieces and supplies for your next project, we exist to make quality art more accessible across Rwanda.`,
  experienceHighlights: [
    'Original artworks from studio practice',
    'Art materials and supplies for creators',
    'Live painting and gallery experiences',
    'Based in Kigali, serving East Africa',
  ],
  quote:
    'We believe art is not only something you hang — it is something you make, share, and live with.',
} as const

export const TRAINING_PROGRAMS = [
  {
    id: 'original-artworks',
    title: 'Original Artworks',
    summary:
      'Studio pieces and commissions for collectors, homes, offices, and public spaces.',
    topics: ['Canvas works', 'Abstract & figurative', 'Commissions', 'Studio collection'],
    href: '/shop',
  },
  {
    id: 'art-materials',
    title: 'Art Materials',
    summary:
      'Paints, brushes, canvases, and tools for students, hobbyists, and professional artists.',
    topics: ['Paints & mediums', 'Brushes & tools', 'Canvases & surfaces', 'Studio essentials'],
    href: '/shop',
  },
  {
    id: 'workshops-events',
    title: 'Workshops & Events',
    summary:
      'Hands-on sessions and creative gatherings for learners and art communities in Kigali.',
    topics: ['Live painting', 'Community sessions', 'Creative learning', 'Studio visits'],
    href: '/learning',
  },
] as const

export const PAYMENT = {
  method: 'MTN Mobile Money (MoMo Pay)',
  momoPayCode: '581661',
  accountName: 'THEOSART LTD',
  workflow:
    'Pay via MTN MoMo using the Pay Code below, then upload your payment receipt so our team can verify and confirm your order or enrollment.',
  steps: [
    'Dial MTN MoMo or use the MoMo app and select Pay Code / Merchant payment.',
    'Enter Pay Code 581661 — account name: THEOSART LTD.',
    'Pay the amount shown on your order or invoice.',
    'Save your MoMo confirmation SMS or screenshot as your receipt.',
    'Submit the receipt through your order, application, or the Payment Receipt page for verification.',
  ],
} as const

export const ABOUT_DEFAULT = `${COMPANY.brandName} is a Rwanda-based art company focused on original artworks, creative experiences, and quality art materials for artists, collectors, and learners.

Through our ${COMPANY.platformName} platform, we offer studio pieces, supplies, and community programmes — combining gallery energy with practical tools for creating and collecting art in Kigali and beyond.`

export const MISSION_DEFAULT = `We make original art and quality art materials accessible — supporting creators, collectors, and learners with studio works, supplies, and inspiring creative experiences across Rwanda.`

export const VISION_DEFAULT = `A Rwanda where every home, workspace, and studio can access authentic art and the materials needed to keep creating — with craftsmanship, community, and cultural expression at the centre.`

export const COMPANY_EXPERIENCE = {
  title: 'Studio Experience',
  subtitle:
    'Original artworks, trusted materials, and creative sessions for artists and collectors in Kigali.',
  stats: [
    { value: 'Art', label: 'Original studio artworks' },
    { value: 'Shop', label: 'Art materials & supplies' },
    { value: 'Live', label: 'Painting & creative events' },
  ],
  capabilities: [
    {
      title: 'Artworks',
      items: ['Studio canvases', 'Custom commissions'],
    },
    {
      title: 'Materials',
      items: ['Paints, brushes & canvases', 'Studio tools'],
    },
    {
      title: 'Community',
      items: ['Workshops & live painting', 'Creative gatherings'],
    },
  ],
  partners: [] as ReadonlyArray<{ name: string; logo: string; logoBg: string }>,
} as const

export const GOALS_DEFAULT = [
  'Offer original artworks that reflect craft, culture, and contemporary studio practice.',
  'Supply quality art materials for students, hobbyists, and professional artists.',
  'Host workshops and creative events that grow Rwanda’s art community.',
  'Make buying art and materials simple through our online shop and local pickup in Kigali.',
  'Support creators with a trusted place to discover pieces, tools, and inspiration.',
] as const
