'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DEFAULT_WEB_SETTINGS,
  type WebSettingsForm,
} from '@/lib/platform/site-settings-schema'
import { Building2, CreditCard, Globe, Home, ImageIcon, Save, User } from 'lucide-react'
import { HeroVideosUploadPanel } from '@/components/admin/hero-videos-upload-panel'
import { HeroImagesUploadPanel } from '@/components/admin/hero-images-upload-panel'

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <Label className="text-slate-800">{label}</Label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  )
}

function SaveSettingsButton({
  onClick,
  saving,
  uploading,
  className = '',
}: {
  onClick: () => void
  saving: boolean
  uploading: boolean
  className?: string
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={saving || uploading}
      className={`bg-[var(--brand-navy)] text-white shrink-0 pointer-events-auto relative z-[60] ${className}`}
    >
      <Save className="h-4 w-4 mr-2" />
      {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save all settings'}
    </Button>
  )
}

export default function WebSettingsPanel() {
  const [form, setForm] = useState<WebSettingsForm>(DEFAULT_WEB_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const logoFileRef = useRef<HTMLInputElement>(null)
  const stampFileRef = useRef<HTMLInputElement>(null)
  const heroFileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'same-origin' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load settings')
      setForm({ ...DEFAULT_WEB_SETTINGS, ...data, hero: { ...DEFAULT_WEB_SETTINGS.hero, ...data.hero } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const patch = <K extends keyof WebSettingsForm>(key: K, value: WebSettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const patchHero = (key: keyof WebSettingsForm['hero'], value: string) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }))
  }

  const uploadImage = async (file: File, folder: 'brand' | 'hero', onUrl: (url: string) => void) => {
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', folder)
      const res = await fetch('/api/admin/upload', { method: 'POST', body, credentials: 'same-origin' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onUrl(data.url)
      setMessage('File uploaded — tap Save all settings to apply.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setMessage(data.message ?? 'Website settings saved. Refresh the public site to see changes.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-slate-600">Loading website settings…</p>
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 relative z-[60]">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Website settings</h1>
          <p className="text-slate-600 mt-1">
            Manage company details, homepage, payments, and SEO for the whole public site.
          </p>
        </div>
        <SaveSettingsButton onClick={handleSave} saving={saving} uploading={uploading} />
      </div>

      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-3">{message}</p>
      ) : null}

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="company" className="data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white">
            <Building2 className="h-4 w-4 mr-1.5 hidden sm:inline" /> Company
          </TabsTrigger>
          <TabsTrigger value="hero" className="data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white">
            <Home className="h-4 w-4 mr-1.5 hidden sm:inline" /> Homepage
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white">
            About
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white">
            <CreditCard className="h-4 w-4 mr-1.5 hidden sm:inline" /> Payments
          </TabsTrigger>
          <TabsTrigger value="founder" className="data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white">
            <User className="h-4 w-4 mr-1.5 hidden sm:inline" /> Founder
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-[var(--brand-navy)] data-[state=active]:text-white">
            <ImageIcon className="h-4 w-4 mr-1.5 hidden sm:inline" /> Brand & SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-slate-900">Company & contact</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label="Legal name">
                <Input value={form.company_legal_name} onChange={(e) => patch('company_legal_name', e.target.value)} />
              </Field>
              <Field label="Brand name (display)">
                <Input value={form.company_brand_name} onChange={(e) => patch('company_brand_name', e.target.value)} />
              </Field>
              <Field label="Platform name">
                <Input value={form.company_platform_name} onChange={(e) => patch('company_platform_name', e.target.value)} />
              </Field>
              <Field label="Slogan">
                <Input value={form.company_slogan} onChange={(e) => patch('company_slogan', e.target.value)} />
              </Field>
              <Field label="Tagline" hint="Short description used in meta and summaries">
                <Input value={form.company_tagline} onChange={(e) => patch('company_tagline', e.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.company_email} onChange={(e) => patch('company_email', e.target.value)} />
              </Field>
              <Field label="Phone (tel link)">
                <Input value={form.company_phone} onChange={(e) => patch('company_phone', e.target.value)} placeholder="+250783986252" />
              </Field>
              <Field label="Phone (display)">
                <Input value={form.company_phone_display} onChange={(e) => patch('company_phone_display', e.target.value)} placeholder="+250 783 986 252" />
              </Field>
              <Field label="WhatsApp number" hint="Digits only, e.g. 250783986252">
                <Input value={form.company_whatsapp} onChange={(e) => patch('company_whatsapp', e.target.value)} />
              </Field>
              <Field label="Address">
                <Input value={form.company_address} onChange={(e) => patch('company_address', e.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-slate-900">Homepage hero</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Headline">
                <Input value={form.hero.title} onChange={(e) => patchHero('title', e.target.value)} />
              </Field>
              <Field label="Subtitle">
                <Textarea rows={3} value={form.hero.subtitle} onChange={(e) => patchHero('subtitle', e.target.value)} />
              </Field>
              <Field
                label="Background image or video URL"
                hint="Use /hero/playlist for rotating stills, /videos/playlist for rotating videos, or a single media URL. Playlist uploads below apply this automatically."
              >
                <Input value={form.hero.background_image} onChange={(e) => patchHero('background_image', e.target.value)} />
              </Field>

              <HeroImagesUploadPanel
                onPlaylistReady={(background) => {
                  patchHero('background_image', background)
                  setMessage('Hero images updated and homepage cache refreshed. Visit the home page to confirm.')
                }}
              />

              <HeroVideosUploadPanel
                onPlaylistReady={(background) => {
                  patchHero('background_image', background)
                  setMessage('Hero videos updated and homepage cache refreshed. Visit the home page to confirm.')
                }}
              />

              <div>
                <Label className="text-slate-800">Upload a single hero image or video</Label>
                <Input
                  ref={heroFileRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  className="mt-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      void uploadImage(file, 'hero', async (url) => {
                        patchHero('background_image', url)
                        try {
                          await fetch('/api/admin/hero-media/apply', {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mode: null }),
                          })
                        } catch {
                          // version bump best-effort; Save all settings still persists the URL
                        }
                        setMessage('Single hero media uploaded. Click Save all settings to publish the new URL.')
                      })
                    }
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">
                  For rotating galleries, prefer the playlist uploaders above so fixed slots are replaced and cache is busted.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Primary button label">
                  <Input value={form.hero.cta_primary_label} onChange={(e) => patchHero('cta_primary_label', e.target.value)} />
                </Field>
                <Field label="Primary button link">
                  <Input value={form.hero.cta_primary_url} onChange={(e) => patchHero('cta_primary_url', e.target.value)} />
                </Field>
                <Field label="Secondary button label">
                  <Input value={form.hero.cta_secondary_label} onChange={(e) => patchHero('cta_secondary_label', e.target.value)} />
                </Field>
                <Field label="Secondary button link">
                  <Input value={form.hero.cta_secondary_url} onChange={(e) => patchHero('cta_secondary_url', e.target.value)} />
                </Field>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-slate-900">About page content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Who we are">
                <Textarea rows={8} value={form.about_content} onChange={(e) => patch('about_content', e.target.value)} />
              </Field>
              <Field label="Mission statement">
                <Textarea rows={6} value={form.mission_content} onChange={(e) => patch('mission_content', e.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-slate-900">Payment instructions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Payment method label">
                <Input value={form.payment_method_label} onChange={(e) => patch('payment_method_label', e.target.value)} />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="MTN MoMo Pay Code">
                  <Input value={form.payment_momo_code} onChange={(e) => patch('payment_momo_code', e.target.value)} />
                </Field>
                <Field label="Account name">
                  <Input value={form.payment_account_name} onChange={(e) => patch('payment_account_name', e.target.value)} />
                </Field>
              </div>
              <Field label="Payment workflow note" hint="Shown on payment cards and instructions">
                <Textarea rows={4} value={form.payment_workflow} onChange={(e) => patch('payment_workflow', e.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founder">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-slate-900">Founder (About page)</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label="Founder name">
                <Input value={form.founder_name} onChange={(e) => patch('founder_name', e.target.value)} />
              </Field>
              <Field label="Founder title">
                <Input value={form.founder_title} onChange={(e) => patch('founder_title', e.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Globe className="h-5 w-5" /> Logo & SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                <strong className="font-semibold text-slate-800">Company logo</strong> is used for the
                homepage, emails, favicon, and reports. There is no separate Email logo upload — upload
                here (https R2 URL), then click <strong>Save all</strong>.
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-lg border bg-white overflow-hidden">
                  <Image src={form.company_logo_url} alt="Logo preview" fill className="object-contain p-1" unoptimized />
                </div>
                <p className="text-sm text-slate-600 break-all">{form.company_logo_url}</p>
              </div>
              <Field
                label="Company / email logo URL"
                hint="Must be an https:// R2 URL. Old /images/... paths will not show in emails."
              >
                <Input value={form.company_logo_url} onChange={(e) => patch('company_logo_url', e.target.value)} />
              </Field>
              <div>
                <Label className="text-slate-800">Upload company / email logo</Label>
                <Input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file)
                      void uploadImage(file, 'brand', (url) => {
                        // Keep certificate logo in sync so print/PDF does not stay on stale /images/ paths
                        setForm((prev) => ({
                          ...prev,
                          company_logo_url: url,
                          certificate_logo_url: prev.certificate_logo_url?.startsWith('/images/')
                            ? url
                            : prev.certificate_logo_url || url,
                        }))
                      })
                  }}
                />
              </div>
              <Field label="SEO page title">
                <Input value={form.seo_title} onChange={(e) => patch('seo_title', e.target.value)} />
              </Field>
              <Field label="SEO description">
                <Textarea rows={3} value={form.seo_description} onChange={(e) => patch('seo_description', e.target.value)} />
              </Field>
              <Field label="SEO keywords" hint="Comma-separated">
                <Input value={form.seo_keywords} onChange={(e) => patch('seo_keywords', e.target.value)} />
              </Field>

              <div className="border-t border-slate-200 pt-4 space-y-4">
                <h3 className="font-semibold text-slate-900">Certificate stamp &amp; signature</h3>
                <p className="text-sm text-slate-600">
                  Used on official certificates of completion. Upload a stamp image (PNG with transparent
                  background works best).
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-lg border bg-white overflow-hidden">
                    <Image
                      src={form.certificate_stamp_url || '/images/company-stamp.png'}
                      alt="Stamp preview"
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm text-slate-600 break-all">
                    {form.certificate_stamp_url || '/images/company-stamp.png'}
                  </p>
                </div>
                <Field label="Stamp image URL">
                  <Input
                    value={form.certificate_stamp_url}
                    onChange={(e) => patch('certificate_stamp_url', e.target.value)}
                  />
                </Field>
                <div>
                  <Label className="text-slate-800">Upload stamp</Label>
                  <Input
                    ref={stampFileRef}
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadImage(file, 'brand', (url) => patch('certificate_stamp_url', url))
                    }}
                  />
                </div>
                <Field
                  label="Certificate logo URL"
                  hint="Use an https:// R2 URL. Leave blank to use the company logo. Avoid /images/ paths — they 404 after media moved to R2."
                >
                  <Input
                    value={form.certificate_logo_url}
                    onChange={(e) => patch('certificate_logo_url', e.target.value)}
                    placeholder={form.company_logo_url || 'Uses company logo'}
                  />
                </Field>
                <div>
                  <Label className="text-slate-800">Upload certificate logo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadImage(file, 'brand', (url) => patch('certificate_logo_url', url))
                    }}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Signatory name">
                    <Input
                      value={form.certificate_signatory_name}
                      onChange={(e) => patch('certificate_signatory_name', e.target.value)}
                    />
                  </Field>
                  <Field label="Signatory title">
                    <Input
                      value={form.certificate_signatory_title}
                      onChange={(e) => patch('certificate_signatory_title', e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="relative z-[60] flex justify-end pt-4 border-t border-slate-200">
        <SaveSettingsButton onClick={handleSave} saving={saving} uploading={uploading} className="w-full sm:w-auto" />
      </div>
    </div>
  )
}
