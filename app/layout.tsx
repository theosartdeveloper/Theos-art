import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PwaRegister } from '@/components/pwa/pwa-register'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'
import { loadPublicCompanyProfile } from '@/lib/platform/site-settings'
import { getSeoLogoUrl, getSiteOrigin } from '@/lib/seo/site'
import { ShopCartProvider } from '@/lib/shop/cart-context'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const [profile, logoUrl] = await Promise.all([
    loadPublicCompanyProfile(),
    getSeoLogoUrl(),
  ])
  const siteUrl = getSiteOrigin()

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: profile.seo.title,
      template: `%s · ${profile.brandName}`,
    },
    description: profile.seo.description,
    keywords: profile.seo.keywords,
    authors: [{ name: profile.legalName }],
    creator: profile.legalName,
    publisher: profile.legalName,
    robots: 'index, follow',
    alternates: {
      canonical: siteUrl,
    },
    icons: logoUrl
      ? {
          icon: [{ url: logoUrl, type: 'image/png' }],
          shortcut: [{ url: logoUrl }],
          apple: [{ url: logoUrl }],
        }
      : undefined,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: profile.brandName,
    },
    openGraph: {
      type: 'website',
      locale: 'en_RW',
      url: siteUrl,
      siteName: profile.brandName,
      title: profile.seo.title,
      description: profile.seo.description,
      images: logoUrl
        ? [{ url: logoUrl, width: 512, height: 512, alt: profile.brandName }]
        : undefined,
    },
    twitter: {
      card: 'summary',
      title: profile.seo.title,
      description: profile.seo.description,
      images: logoUrl ? [logoUrl] : undefined,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} font-sans antialiased`}>
        <OrganizationJsonLd />
        <ShopCartProvider>
          {children}
        </ShopCartProvider>
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  )
}
