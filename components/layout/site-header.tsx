'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { COMPANY } from '@/lib/company/constants'

/** Primary public nav — other routes stay wired in the app, just not listed here. */
const PRIMARY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/art-gallery', label: 'Art Gallery' },
  { href: '/about', label: 'About' },
] as const

const headerNavButtonClass =
  'text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/40 h-9 px-3 text-sm font-medium'

const desktopHeaderInnerClass =
  'hidden lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6 max-w-7xl mx-auto w-full px-6 xl:px-8 py-2.5'

const mobileNavLinkClass =
  'block rounded-lg px-3 py-2.5 text-base font-medium text-slate-950 hover:bg-slate-100 no-underline hover:no-underline'

function BrandMark({
  logoUrl,
  compact = false,
}: {
  logoUrl: string
  compact?: boolean
}) {
  return (
    <div className="bg-white rounded-md p-1 shrink-0 shadow-sm border border-white/80">
      <Image
        src={logoUrl}
        alt={`${COMPANY.brandName} logo`}
        width={compact ? 40 : 120}
        height={compact ? 40 : 48}
        className={
          compact
            ? 'rounded object-contain h-9 w-9'
            : 'rounded object-contain h-10 w-auto max-h-11 max-w-[140px]'
        }
        priority
        unoptimized
      />
    </div>
  )
}

function MobileNavSheet({
  logoUrl,
  open,
  onOpenChange,
}: {
  logoUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="site-header-menu-btn h-9 rounded-lg bg-white text-[var(--brand-navy)] hover:bg-slate-100 hover:text-[var(--brand-navy)] shadow-sm border border-white/90 shrink-0 px-3 gap-2 font-semibold text-sm"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="mobile-nav-sheet w-[min(100vw-1.5rem,22rem)] overflow-y-auto bg-white p-0 [&>[data-slot=sheet-close]]:top-4 [&>[data-slot=sheet-close]]:right-4 [&>[data-slot=sheet-close]]:text-slate-700 [&>[data-slot=sheet-close]]:opacity-100 [&>[data-slot=sheet-close]]:hover:bg-slate-100 [&>[data-slot=sheet-close]]:rounded-md"
      >
        <SheetHeader className="border-b border-slate-200 bg-slate-50 px-4 py-4 pr-12">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-3 no-underline hover:no-underline"
          >
            <BrandMark logoUrl={logoUrl} compact />
            <SheetTitle className="text-base font-bold text-[var(--brand-navy)] truncate">
              {COMPANY.brandName}
            </SheetTitle>
          </Link>
        </SheetHeader>
        <div className="px-4 pb-6">
          <div className="mobile-nav-panel flex flex-col gap-6 py-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 px-1">Menu</p>
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={mobileNavLinkClass}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4">
              <Link href="/auth/login" onClick={close} className="no-underline hover:no-underline">
                <Button className="w-full bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90 font-semibold">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [logoUrl, setLogoUrl] = useState(COMPANY.logoUrl)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/public/logo')
      .then((res) => res.json())
      .then((data) => {
        if (data.logoUrl) setLogoUrl(data.logoUrl)
      })
      .catch(() => {})
  }, [])

  return (
    <nav
      className={`site-header text-on-dark z-50 w-full border-b border-white/10 shadow-md ${
        overlay
          ? 'absolute top-0 left-0 right-0 bg-[var(--brand-navy)]/90 backdrop-blur-sm'
          : 'sticky top-0 bg-[var(--brand-navy)]'
      }`}
    >
      <div className={desktopHeaderInnerClass}>
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 hover:opacity-90 transition no-underline hover:no-underline min-w-0"
        >
          <BrandMark logoUrl={logoUrl} />
          <div className="min-w-0 hidden xl:block max-w-[12rem]">
            <p className="font-bold text-base leading-tight text-white truncate">{COMPANY.brandName}</p>
            <p className="text-[10px] text-white/75 truncate leading-snug">{COMPANY.slogan}</p>
          </div>
        </Link>

        <div className="flex items-center justify-center gap-1 min-w-0">
          {PRIMARY_NAV.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className={headerNavButtonClass}>
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end shrink-0">
          <Link href="/auth/login" className="no-underline hover:no-underline">
            <Button
              size="sm"
              className="bg-white text-[var(--brand-navy)] hover:bg-slate-100 font-semibold h-9 px-4 shadow-sm border border-white"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>

      <div className="lg:hidden flex w-full items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <MobileNavSheet logoUrl={logoUrl} open={mobileOpen} onOpenChange={setMobileOpen} />
          <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline min-w-0">
            <BrandMark logoUrl={logoUrl} compact />
            <span className="font-bold text-sm text-white truncate">{COMPANY.brandName}</span>
          </Link>
        </div>

        <div className="site-header-mobile-auth flex items-center shrink-0">
          <Link href="/auth/login" className="no-underline hover:no-underline">
            <Button
              size="sm"
              className="h-9 px-3 text-sm font-semibold bg-white text-[var(--brand-navy)] hover:bg-slate-100 shadow-sm border border-white"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
