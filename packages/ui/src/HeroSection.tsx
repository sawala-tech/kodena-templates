interface HeroSectionProps {
  title: string
  subtitle?: string
  imageUrl?: string
  imageAlt?: string
  ctaLabel?: string
  ctaHref?: string
}

export function HeroSection({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  ctaLabel,
  ctaHref,
}: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-50 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-lg leading-relaxed text-zinc-600">{subtitle}</p>
          ) : null}
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              className="inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt ?? ''}
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm"
            loading="eager"
            decoding="async"
          />
        ) : null}
      </div>
    </section>
  )
}
