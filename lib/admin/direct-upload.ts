/** Browser PUT to a presigned R2/S3 URL with progress + clear CORS errors. */

export function corsUploadHint(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'your-site-origin'
  return (
    `Media CDN blocked the upload (usually R2 CORS). In Cloudflare → R2 → your bucket → Settings → CORS, ` +
    `allow origin "${origin}" (or paste scripts/43-r2-cors.json). Methods: GET, PUT, HEAD. AllowedHeaders: *. ` +
    `Then retry.`
  )
}

export function uploadWithProgress(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    // Prefer the type we signed/expect; empty File.type is common for some MOVs
    const type = (contentType || file.type || 'application/octet-stream').trim()
    if (type) {
      xhr.setRequestHeader('Content-Type', type)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      const detail = xhr.responseText?.slice(0, 200)
      if (xhr.status === 0 || xhr.status === 403 || xhr.status === 400) {
        reject(
          new Error(
            detail
              ? `Upload rejected (${xhr.status}): ${detail}. ${corsUploadHint()}`
              : `Upload rejected (${xhr.status}). ${corsUploadHint()}`
          )
        )
        return
      }
      reject(
        new Error(detail ? `Upload failed (${xhr.status}): ${detail}` : `Upload failed (${xhr.status})`)
      )
    }

    xhr.onerror = () => reject(new Error(corsUploadHint()))
    xhr.onabort = () => reject(new Error('Upload cancelled'))

    const onAbort = () => xhr.abort()
    signal.addEventListener('abort', onAbort, { once: true })

    xhr.send(file)
  })
}

/** Direct PUT; on network/CORS failure, fall back to server proxy for smaller files. */
export async function uploadHeroFileWithFallback(options: {
  signedUrl: string
  file: File
  slotName: string
  contentType: string
  proxyEndpoint: '/api/admin/hero-videos' | '/api/admin/hero-images'
  onProgress: (percent: number) => void
  signal: AbortSignal
  /** Vercel body limit is ~4.5MB on many plans — only proxy below this. */
  maxProxyBytes?: number
}): Promise<void> {
  const maxProxy = options.maxProxyBytes ?? 3.5 * 1024 * 1024

  try {
    await uploadWithProgress(
      options.signedUrl,
      options.file,
      options.contentType,
      options.onProgress,
      options.signal
    )
    return
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const looksLikeCors =
      message.includes('CORS') || message.includes('Network error') || message.includes('blocked')

    if (!looksLikeCors || options.file.size > maxProxy) {
      throw err
    }

    // Small-file server-side fallback when browser→R2 CORS is misconfigured
    options.onProgress(5)
    const form = new FormData()
    form.append(options.slotName, options.file, options.slotName)
    const res = await fetch(options.proxyEndpoint, {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
      signal: options.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(
        (data as { error?: string }).error ||
          `Server upload failed (${res.status}). Fix R2 CORS for larger files: ${corsUploadHint()}`
      )
    }
    options.onProgress(100)
  }
}
