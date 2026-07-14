import { supabaseAdmin } from '@/lib/supabaseAdmin'

const VERSION_KEY = 'hero_media_version'

export async function loadHeroMediaVersion(): Promise<string> {
  if (!supabaseAdmin) return ''
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', VERSION_KEY)
    .maybeSingle()
  return String(data?.value ?? '').trim()
}

/** Bump cache-bust version and optionally switch hero playlist mode. */
export async function applyHeroMediaUpdate(options: {
  mode?: 'videos' | 'images' | null
}): Promise<{ version: string; background_image?: string }> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured')
  }

  const version = String(Date.now())
  const now = new Date().toISOString()

  const { error: versionError } = await supabaseAdmin.from('site_settings').upsert(
    { key: VERSION_KEY, value: version, updated_at: now },
    { onConflict: 'key' }
  )
  if (versionError) throw new Error(versionError.message)

  let background_image: string | undefined
  if (options.mode === 'videos') background_image = '/videos/playlist'
  if (options.mode === 'images') background_image = '/hero/playlist'

  if (background_image) {
    const { data: active } = await supabaseAdmin
      .from('site_hero')
      .select('id')
      .eq('is_active', true)
      .maybeSingle()

    if (active?.id) {
      const { error } = await supabaseAdmin
        .from('site_hero')
        .update({ background_image, updated_at: now })
        .eq('id', active.id)
      if (error) throw new Error(error.message)
    } else {
      await supabaseAdmin.from('site_hero').update({ is_active: false }).eq('is_active', true)
      const { error } = await supabaseAdmin.from('site_hero').insert([
        {
          title: 'Theos Art',
          background_image,
          is_active: true,
          updated_at: now,
        },
      ])
      if (error) throw new Error(error.message)
    }
  }

  return { version, background_image }
}
