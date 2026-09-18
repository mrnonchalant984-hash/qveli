const emmaAvatar = 'https://i.pravatar.cc/40?img=32';
const alexAvatar = 'https://i.pravatar.cc/40?img=8';
const coffeeImage = 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80';

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-white text-neutral-950 transition-colors duration-300 dark:bg-neutral-950 dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.04),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(0,0,0,0.05),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4 rounded-full border border-neutral-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-950 text-sm font-black text-white dark:bg-white dark:text-neutral-950">
              Q
            </div>
            <span className="text-xl font-semibold tracking-tight">Qevli</span>
          </div>

          <div className="hidden items-center gap-7 text-sm text-neutral-600 dark:text-neutral-300 md:flex">
            <a href="#features" className="transition hover:text-neutral-950 dark:hover:text-white">Features</a>
            <a href="#community" className="transition hover:text-neutral-950 dark:hover:text-white">Community</a>
            <a href="#about" className="transition hover:text-neutral-950 dark:hover:text-white">About</a>
          </div>

          <button className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
            Get started
          </button>
        </nav>

        <div className="grid items-center gap-12 pt-14 pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              A new social experience
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Connect.<br />
              Share.<br />
              Grow.
            </h1>

            <p className="mt-6 max-w-lg text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
              Qevli brings together people, ideas, and communities in one cleaner, calmer social space.
            </p>

            <div className="mt-8 flex flex-wrap gap-2 text-sm text-neutral-700 dark:text-neutral-200">
              {['Privacy first', 'Fast & lightweight', 'Built for everyone'].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {pill}
                </span>
              ))}
            </div>

            <p className="mt-8 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              A modern social platform built for real people, meaningful conversations, and communities that grow naturally.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[300px] rounded-[42px] bg-black p-3 shadow-[0_30px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_rgba(255,255,255,0.08)]">
              <div className="h-[580px] overflow-hidden rounded-[34px] bg-[#f5f5f4] p-3 text-neutral-900 dark:bg-[#111111] dark:text-white">
                <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-medium">
                  <span className="text-[12px] font-semibold">Qevli</span>
                  <span>9:41</span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-full border border-neutral-200 bg-white/80 px-3 py-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
                  <img src={emmaAvatar} alt="Emma" className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">What&apos;s happening? Share a moment with your people.</span>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-2">
                      <img src={emmaAvatar} alt="Emma avatar" className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">emma</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">2h</div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-5 text-neutral-700 dark:text-neutral-200">
                      Just joined Qevli — excited to connect with like-minded creators here! ✨
                    </p>

                    <img
                      src={coffeeImage}
                      alt="Coffee and notebook"
                      className="mt-3 h-32 w-full rounded-xl object-cover"
                    />

                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>♥ 12</span>
                      <span>💬 3</span>
                      <span>↗ Share</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-2">
                      <img src={alexAvatar} alt="Alex avatar" className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">alex</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">5h</div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-5 text-neutral-700 dark:text-neutral-200">
                      Testing the new privacy controls. Love how simple it is.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
