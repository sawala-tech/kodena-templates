import { createKontenaClient, type KontenaClient } from '@sawala/kontena-client'
import { loadConfig } from './config'

let cached: KontenaClient | undefined

/**
 * Lazily-constructed Kontena public-read client for the Blog template.
 * Uses the published `@sawala/kontena-client` (>=0.2) which provides the
 * collection surface a blog needs (`listCollection`, `getCollectionEntry`)
 * in addition to `getSingle`.
 */
export function getKontenaClient(): KontenaClient {
  if (cached) return cached
  const config = loadConfig()
  cached = createKontenaClient({
    baseUrl: config.kontenaBaseUrl,
    projectId: config.kontenaProjectId,
    publicApiKey: config.kontenaPublicApiKey,
  })
  return cached
}
