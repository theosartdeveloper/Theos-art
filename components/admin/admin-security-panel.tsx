'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminSectionHeader } from '@/components/admin/admin-section-header'

export default function AdminSecurityPanel() {
  const [enabled, setEnabled] = useState(false)
  const [secret, setSecret] = useState('')
  const [otpUri, setOtpUri] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/security/2fa')
    const data = await res.json()
    setEnabled(Boolean(data.enabled))
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const startSetup = async () => {
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/security/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'setup' }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Setup failed')
      return
    }
    setSecret(data.secret)
    setOtpUri(data.otpUri)
    setMessage('Scan the secret into Google Authenticator or Authy, then enter a code to confirm.')
  }

  const confirmSetup = async () => {
    setError('')
    const res = await fetch('/api/admin/security/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'confirm', code, secret }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Invalid code')
      return
    }
    setEnabled(true)
    setSecret('')
    setOtpUri('')
    setCode('')
    setMessage('Two-factor authentication is now enabled for your admin account.')
  }

  const disable = async () => {
    setError('')
    const res = await fetch('/api/admin/security/2fa', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Could not disable 2FA')
      return
    }
    setEnabled(false)
    setCode('')
    setMessage('Two-factor authentication disabled.')
  }

  const changePassword = async () => {
    setPasswordError('')
    setPasswordMessage('')
    if (!currentPassword || !newPassword) {
      setPasswordError('Enter your current password and a new password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordError(data.error || 'Could not update password')
        return
      }
      setPasswordMessage(data.message || 'Password updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError('Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <p className="text-slate-600">Loading security settings…</p>

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Security"
        description="Change your admin password and protect sign-in with an authenticator app (TOTP)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          {passwordMessage ? <p className="text-sm text-green-700">{passwordMessage}</p> : null}
          {passwordError ? <p className="text-sm text-red-700">{passwordError}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => void changePassword()}
            disabled={savingPassword}
            className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-deep)]"
          >
            {savingPassword ? 'Updating…' : 'Update password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <p className="text-sm text-slate-600">
            Status:{' '}
            <strong className={enabled ? 'text-green-700' : 'text-amber-700'}>
              {enabled ? 'Enabled' : 'Not enabled'}
            </strong>
          </p>

          {!enabled && !secret ? (
            <Button type="button" onClick={() => void startSetup()}>
              Set up authenticator
            </Button>
          ) : null}

          {secret ? (
            <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Setup key</p>
              <p className="font-mono text-sm break-all">{secret}</p>
              {otpUri ? (
                <p className="text-xs text-slate-600 break-all">URI: {otpUri}</p>
              ) : null}
              <div className="space-y-2">
                <Label>6-digit code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} />
              </div>
              <Button type="button" onClick={() => void confirmSetup()}>
                Confirm and enable
              </Button>
            </div>
          ) : null}

          {enabled ? (
            <div className="space-y-2">
              <Label>Enter current code to disable</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} />
              <Button type="button" variant="outline" onClick={() => void disable()}>
                Disable 2FA
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
