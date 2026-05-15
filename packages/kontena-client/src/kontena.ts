import type {
  KontenaClientOptions,
  KontenaEntry,
  KontenaSystemColumns,
  Locale,
} from './types'

/**
 * Minimal Kontena public-API client for static templates.
 *
 * Exposes only the one method static landing/marketing templates need:
 * `getSingle<T>(schemaSlug, locale)` — fetches a single-type content entry
 * from `GET {baseUrl}/projects/{projectId}/content/single/{schemaSlug}`.
 *
 * The public API returns each row as a flat object whose row-level
 * columns (`id`, `documentId`, `locale`, `slug`, `status`, `publishedAt`,
 * `createdAt`, `updatedAt`) live at the top level and whose user-defined
 * schema fields are nested under `data`. This client flattens the user
 * fields to the top level and exposes the system columns under `_row`.
 */
export interface KontenaClient {
  getSingle<T>(schemaSlug: string, locale: Locale): Promise<KontenaEntry<T> | null>
}

interface RawRow {
  id?: string
  documentId?: string
  locale?: string
  slug?: string | null
  status?: 'draft' | 'published'
  data?: Record<string, unknown>
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

function unwrapRow<T>(row: RawRow | null | undefined): KontenaEntry<T> | null {
  if (!row) return null
  const userData = (row.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>
  const _row: KontenaSystemColumns = {
    id: row.id,
    documentId: row.documentId,
    locale: row.locale,
    slug: row.slug,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
  return { ...userData, _row } as KontenaEntry<T>
}

export function createKontenaClient(opts: KontenaClientOptions): KontenaClient {
  const fetchImpl = opts.fetchImpl ?? fetch
  const base = opts.baseUrl.replace(/\/$/, '')
  const headers: HeadersInit = {
    'X-API-Key': opts.publicApiKey,
    accept: 'application/json',
  }

  function url(path: string, search: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    params.set('format', 'strapi-v5')
    for (const [k, v] of Object.entries(search)) {
      if (v !== undefined && v !== '') params.set(k, v)
    }
    return `${base}/projects/${opts.projectId}${path}?${params.toString()}`
  }

  async function getJson<R>(u: string): Promise<R | null> {
    const res = await fetchImpl(u, { headers })
    if (res.status === 404) return null
    if (!res.ok) {
      throw new Error(`Kontena ${res.status} ${res.statusText} for ${u}`)
    }
    return (await res.json()) as R
  }

  return {
    async getSingle<T>(schemaSlug: string, locale: Locale): Promise<KontenaEntry<T> | null> {
      const u = url(`/content/single/${schemaSlug}`, { locale })
      const row = await getJson<RawRow>(u)
      return unwrapRow<T>(row)
    },
  }
}
