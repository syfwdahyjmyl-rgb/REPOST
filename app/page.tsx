import Link from "next/link";
import { appConfig } from "@/src/lib/config";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3.25 8h9.5M8.75 3.5 13.25 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-black shadow-[0_0_32px_rgba(99,228,242,.25)]" aria-hidden="true">
      <span className="h-3 w-3 rounded-full bg-[linear-gradient(135deg,#63e4f2,#ff6ea8)]" />
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-glow pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
      <header className="shell relative flex items-center justify-between py-6">
        <Link className="flex items-center gap-3 font-semibold tracking-tight" href="/" aria-label="RepostFlow home">
          <Mark />
          <span>RepostFlow</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1.5 text-cyan sm:inline-flex">
            {appConfig.isDemo ? "Demo mode" : "Integration mode"}
          </span>
          <a className="rounded-full border border-white/15 px-4 py-2 text-white/75 transition hover:border-white/40 hover:text-white" href="#how-it-works">
            How it works
          </a>
        </div>
      </header>

      <section className="shell relative grid gap-16 pb-24 pt-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:pb-36 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_#63e4f2]" />
            A calm workspace for your repost list
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-7xl">
            Clear your reposts.
            <span className="mt-2 block bg-gradient-to-r from-cyan to-rose bg-clip-text text-transparent">Keep your account yours.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
            RepostFlow helps you organize a personal removal workflow. Open each video in TikTok, use TikTok&apos;s own Remove repost action, and keep an honest record of your progress.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan" href="#workspace">
              Open workspace <ArrowIcon />
            </a>
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/75 transition hover:border-white/40 hover:text-white" href="#how-it-works">
              Learn more <ArrowIcon />
            </a>
          </div>
          <p className="mt-5 text-xs text-white/35">No TikTok password is ever requested here.</p>
        </div>

        <div id="workspace" className="relative rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="rounded-[21px] border border-white/10 bg-[#0d0f15] p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">Workspace</p>
                <h2 className="mt-1 text-lg font-medium">Your removal list</h2>
              </div>
              <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs text-cyan">Demo</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-white/10 py-5 text-center">
              <div><p className="text-2xl font-semibold">12</p><p className="mt-1 text-[11px] text-white/35">Tracked</p></div>
              <div><p className="text-2xl font-semibold text-cyan">08</p><p className="mt-1 text-[11px] text-white/35">Completed</p></div>
              <div><p className="text-2xl font-semibold text-rose">04</p><p className="mt-1 text-[11px] text-white/35">To review</p></div>
            </div>
            <div className="space-y-2 pt-5">
              {[
                ["Morning walk · @creator", "Completed", "text-cyan"],
                ["Recipe ideas · @kitchen", "Ready to open", "text-rose"],
                ["Studio notes · @design", "Ready to open", "text-rose"],
              ].map(([title, status, color]) => (
                <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3" key={title}>
                  <div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-white/20" /><span className="text-sm text-white/75">{title}</span></div>
                  <span className={`text-[11px] ${color}`}>{status}</span>
                </div>
              ))}
            </div>
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-white/45" type="button" disabled>
              TikTok connection available soon
            </button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="shell relative border-t border-white/10 py-16 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            ["01", "Collect", "Add links to your personal list as you find them."],
            ["02", "Open in TikTok", "Use the official TikTok app or website to remove a repost."],
            ["03", "Confirm", "Mark the result and keep your history accurate."],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <p className="text-xs tracking-[0.2em] text-cyan">{number}</p>
              <h2 className="mt-4 text-lg font-medium">{title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/45">{copy}</p>
            </article>
          ))}
        </div>
        <p className="mt-16 text-center text-xs text-white/30">RepostFlow is an independent tool and is not affiliated with or endorsed by TikTok.</p>
      </section>
    </main>
  );
}
