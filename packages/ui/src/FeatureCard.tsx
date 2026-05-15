interface FeatureCardProps {
  iconEmoji?: string
  title: string
  body?: string
}

export function FeatureCard({ iconEmoji, title, body }: FeatureCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-6">
      {iconEmoji ? (
        <span aria-hidden className="text-3xl">
          {iconEmoji}
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {body ? <p className="text-sm leading-relaxed text-zinc-600">{body}</p> : null}
    </article>
  )
}
