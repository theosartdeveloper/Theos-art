'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { Edit2, Plus, Trash2 } from 'lucide-react'

type ArtEvent = {
  id: string
  title: string
  description: string | null
  event_type: string
  start_date: string | null
  end_date: string | null
  location: string | null
  image_url: string | null
  is_past: boolean
  status: string
}

const emptyForm = {
  title: '',
  description: '',
  event_type: 'exhibition',
  start_date: '',
  end_date: '',
  location: '',
  image_url: '',
  status: 'published',
}

function toLocalInput(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoOrNull(value: string) {
  if (!value.trim()) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export default function EventManagementPanel() {
  const [events, setEvents] = useState<ArtEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ArtEvent | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          start_date: toIsoOrNull(form.start_date),
          end_date: toIsoOrNull(form.end_date),
          image_url: form.image_url || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      setForm(emptyForm)
      setIsCreateOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (item: ArtEvent) => {
    setEditing(item)
    setEditForm({
      title: item.title,
      description: item.description || '',
      event_type: item.event_type || 'exhibition',
      start_date: toLocalInput(item.start_date),
      end_date: toLocalInput(item.end_date),
      location: item.location || '',
      image_url: item.image_url || '',
      status: item.status || 'published',
    })
    setError('')
  }

  const handleUpdate = async () => {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/events/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          start_date: toIsoOrNull(editForm.start_date),
          end_date: toIsoOrNull(editForm.end_date),
          image_url: editForm.image_url || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this art event?')) return
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    void load()
  }

  if (isLoading) {
    return <p className="text-slate-600">Loading art events…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Art Events</h2>
          <p className="text-slate-600 mt-1 text-sm max-w-2xl">
            Published events appear on the homepage <strong>Art Events</strong> section. Add an image,
            date, and location so visitors know what is coming up at the studio.
          </p>
        </div>
        <Button
          onClick={() => {
            setError('')
            setIsCreateOpen(true)
          }}
          className="bg-[var(--brand-navy)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create event
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Create art event</DialogTitle>
          </DialogHeader>
          <EventForm form={form} setForm={setForm} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-[var(--brand-navy)]">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <p className="text-slate-800 font-medium">No art events yet</p>
            <p className="text-sm text-slate-600">
              Create an exhibition, open studio day, or live painting session and set status to
              Published.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden border-l-4 border-l-[var(--brand-orange)]">
              {event.image_url ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-32 bg-muted flex items-center justify-center text-sm text-slate-600">
                  No image
                </div>
              )}
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {event.event_type || 'Art event'} · {event.status}
                      {event.start_date
                        ? ` · ${new Date(event.start_date).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{event.is_past ? 'Past' : 'Upcoming'}</Badge>
                </div>
                {event.description ? (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{event.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(event)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Edit art event</DialogTitle>
          </DialogHeader>
          <EventForm form={editForm} setForm={setEditForm} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving} className="bg-[var(--brand-navy)]">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EventForm({
  form,
  setForm,
}: {
  form: typeof emptyForm
  setForm: (value: typeof emptyForm) => void
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <Label>Title</Label>
        <Input
          className="mt-1"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Open studio Saturday"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          className="mt-1"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What visitors can expect"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Event type</Label>
          <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exhibition">Exhibition</SelectItem>
              <SelectItem value="open_studio">Open studio</SelectItem>
              <SelectItem value="live_painting">Live painting</SelectItem>
              <SelectItem value="workshop_day">Workshop day</SelectItem>
              <SelectItem value="community">Community gathering</SelectItem>
              <SelectItem value="art_event">Other art event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published (shows on Home)</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Start date & time</Label>
          <Input
            className="mt-1"
            type="datetime-local"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label>End date & time (optional)</Label>
          <Input
            className="mt-1"
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Location</Label>
        <Input
          className="mt-1"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Theos Art Hub, Kigali"
        />
      </div>
      <ImageUploadField
        label="Event image"
        folder="announcements"
        value={form.image_url}
        onChange={(url) => setForm({ ...form, image_url: url })}
      />
    </div>
  )
}
