export default function GuidePage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">Conjugation Guide</h1>
        <p className="mt-2 text-slate-600">
          Quick reference for the forms used in practice. This page focuses on common patterns and practical meaning.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">Formal Present</h2>
            <p className="text-sm text-slate-600">Meaning: “do / is” in polite style.</p>
            <p className="mt-1 text-sm"><span className="font-medium">Example:</span> 食べます / 静かです</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">Formal Past</h2>
            <p className="text-sm text-slate-600">Meaning: “did / was” in polite style.</p>
            <p className="mt-1 text-sm"><span className="font-medium">Example:</span> 飲みました / 学生でした</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">Formal Negative / Past Negative</h2>
            <p className="text-sm text-slate-600">Meaning: “don’t / isn’t” and “didn’t / wasn’t”.</p>
            <p className="mt-1 text-sm"><span className="font-medium">Example:</span> 行きません / 大きくなかったです</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">Te-form (Casual)</h2>
            <p className="text-sm text-slate-600">Connects actions: “and…”, requests, and progressive forms.</p>
            <p className="mt-1 text-sm"><span className="font-medium">Example:</span> 行って / 飲んで / 見て</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">Potential</h2>
            <p className="text-sm text-slate-600">Meaning: “can / is possible to”.</p>
            <p className="mt-1 text-sm"><span className="font-medium">Example:</span> 食べられます / できます / 来られます</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold">Adverb Form</h2>
            <p className="text-sm text-slate-600">Turns adjectives into adverbs.</p>
            <p className="mt-1 text-sm"><span className="font-medium">Example:</span> 早い → 早く, 静か → 静かに</p>
          </div>
        </div>
      </section>
    </main>
  );
}
