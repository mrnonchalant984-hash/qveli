const emmaAvatar = 'https://i.pravatar.cc/40?img=32';
const alexAvatar = 'https://i.pravatar.cc/40?img=8';
const coffeeImage = 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80';

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-[#f7f7f5] text-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.04),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.06),_transparent_28%)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4 rounded-full border border-neutral-200/80 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.03)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-sm font-black text-white">
              Q
            </div>
            <span className="text-xl font-semibold tracking-[-0.06em]">Qevli</span>
          </div>

          <div className="hidden items-center gap-7 text-sm text-neutral-600 md:flex">
            <a href="#features" className="transition hover:text-neutral-950">Features</a>
            <a href="#community" className="transition hover:text-neutral-950">Community</a>
            <a href="#about" className="transition hover:text-neutral-950">About</a>
          </div>

          <a href="/signup" className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
            Get started
          </a>
        </nav>

        <div className="grid items-center gap-10 pb-10 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-20">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Social built for real connection
            </div>

            <h1 className="text-5xl font-black leading-[0.94] tracking-[-0.07em] text-neutral-950 sm:text-6xl lg:text-7xl">
              Connect.<br />
              Share.<br />
              Grow.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
              Qevli brings people, ideas, and communities together in a cleaner, calmer social space designed for everyday life.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/signup" className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                Create account
              </a>
              <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50">
                Explore features
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-6 text-sm text-neutral-600">
              <div>
                <div className="text-lg font-bold text-neutral-950">10k+</div>
                <div>active members</div>
              </div>
              <div>
                <div className="text-lg font-bold text-neutral-950">4.9/5</div>
                <div>community rating</div>
              </div>
              <div>
                <div className="text-lg font-bold text-neutral-950">24/7</div>
                <div>community flow</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[300px] rounded-[40px] bg-neutral-950 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="h-[580px] overflow-hidden rounded-[32px] bg-[#f4f4f2] p-3 text-neutral-900">
                <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-medium text-neutral-700">
                  <span className="text-[12px] font-semibold text-neutral-900">Qevli</span>
                  <span>9:41</span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                  <img src={emmaAvatar} alt="Emma" className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-xs text-neutral-500">What&apos;s happening? Share your moment.</span>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <img src={emmaAvatar} alt="Emma avatar" className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">emma</div>
                        <div className="text-[11px] text-neutral-500">2h</div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-5 text-neutral-700">
                      Just joined Qevli — excited to connect with like-minded creators here! ✨
                    </p>

                    <img src={coffeeImage} alt="Coffee and notebook" className="mt-3 h-32 w-full rounded-xl object-cover" />

                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                      <span>♥ 12</span>
                      <span>💬 3</span>
                      <span>↗ Share</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <img src={alexAvatar} alt="Alex avatar" className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">alex</div>
                        <div className="text-[11px] text-neutral-500">5h</div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-5 text-neutral-700">
                      Love how simple the community feels. Feels like a place people actually want to return to.
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
