import { isConfigured, loadConfig } from '@/lib/config'

// M0: deployable-empty. When the shop isn't configured, render a placeholder that
// doubles as fork documentation (which env vars to set). M1 replaces the
// "coming soon" branch with the live product grid.
export default function Home() {
  const config = loadConfig()

  if (!isConfigured(config)) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold">Storefront not configured</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Set these environment variables and redeploy to point this shop at your storefront:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5">NEXT_PUBLIC_STOREFRONT_SLUG</code> — your storefront slug</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5">KIOSNA_PUBLISHABLE_KEY</code> — a publishable <code>pk_…</code> key (never a secret <code>sk_</code> key)</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5">API_BASE_URL</code> — e.g. <code>https://api.sawala.cloud</code></li>
        </ul>
        <p className="mt-4 text-xs text-zinc-400">See the README for the full fork &amp; deploy walkthrough.</p>
      </div>
    )
  }

  // Configured but M1 (browse) not yet wired — replaced in M1.
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8">
      <h1 className="text-xl font-semibold">{config.siteName}</h1>
      <p className="mt-2 text-sm text-zinc-600">Shop coming soon.</p>
    </div>
  )
}
