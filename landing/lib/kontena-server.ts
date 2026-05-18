import { createKontenaClient, type KontenaClient } from '@sawala/kontena-client'
import { loadConfig } from './config'

let cached: KontenaClient | undefined

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
