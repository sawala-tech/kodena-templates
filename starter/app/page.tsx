import site from '@/content/site.json'

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>{site.title}</h1>
        <p className="tagline">{site.tagline}</p>
      </section>
      <section className="cards">
        {site.sections.map((section) => (
          <article className="card" key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </>
  )
}
