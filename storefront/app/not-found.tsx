import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-zinc-500">That product doesn&apos;t exist or isn&apos;t available.</p>
      <Link href="/" className="mt-4 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">Back to shop</Link>
    </div>
  )
}
