export type Locale = 'id' | 'en'

export interface KontenaSystemColumns {
  id?: string
  documentId?: string
  locale?: string
  slug?: string | null
  status?: 'draft' | 'published'
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type KontenaEntry<T> = T & { _row: KontenaSystemColumns }

export interface KontenaClientOptions {
  baseUrl: string
  projectId: string
  publicApiKey: string
  fetchImpl?: typeof fetch
}
