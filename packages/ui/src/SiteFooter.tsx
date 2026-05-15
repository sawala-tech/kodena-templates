export interface SocialLink {
  platform: string
  url: string
}

interface SiteFooterProps {
  siteName: string
  footerText?: string
  socialLinks?: ReadonlyArray<SocialLink>
}

export function SiteFooter({ siteName, footerText, socialLinks }: SiteFooterProps) {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-zinc-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-900">{siteName}</p>
          {footerText ? <p>{footerText}</p> : null}
          <p className="text-xs">© {year} {siteName}</p>
        </div>
        {socialLinks && socialLinks.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-4 text-sm">
            {socialLinks.map((s) => (
              <li key={s.platform + s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 transition hover:text-zinc-900"
                >
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  )
}
