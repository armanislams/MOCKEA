export const HowItWorks = () => {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            How it Works
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            A simple path to higher scores
          </h2>
        </div>

        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0028a1] text-white text-lg font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Register & Login</h3>
                <p className="text-sm text-gray-500">Signup securely using email and form details.</p>
              </div>
            </div>
            <div className="flex h-32 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white">
              <div className="text-center text-sm text-gray-500">
                <div className="mb-2 font-semibold text-gray-900">Login</div>
                <div className="space-y-2">
                  <div className="h-2 w-24 rounded-full bg-gray-200 mx-auto"></div>
                  <div className="h-2 w-16 rounded-full bg-gray-200 mx-auto"></div>
                  <div className="h-2 w-20 rounded-full bg-gray-200 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12H34" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M28 6L34 12L28 18" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="flex-1 rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0028a1] text-white text-lg font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Choose a Module</h3>
                <p className="text-sm text-gray-500">Pick Reading, Listening, Writing or Speaking.</p>
              </div>
            </div>
            <div className="grid gap-3 rounded-3xl bg-white p-4 text-center text-sm text-gray-500 border border-dashed border-gray-200">
              <div className="rounded-2xl bg-slate-100 p-3">Reading</div>
              <div className="rounded-2xl bg-slate-100 p-3">Listening</div>
              <div className="rounded-2xl bg-slate-100 p-3">Writing</div>
              <div className="rounded-2xl bg-slate-100 p-3">Speaking</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12H34" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M28 6L34 12L28 18" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="flex-1 rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0028a1] text-white text-lg font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Get Results & Improve</h3>
                <p className="text-sm text-gray-500">Track performance, strengths, and progress.</p>
              </div>
            </div>
            <div className="grid gap-3 rounded-3xl bg-white p-4 text-gray-500 border border-dashed border-gray-200">
              <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-3">
                <span>Score</span>
                <span className="text-blue-900 font-semibold">8.0</span>
              </div>
              <div className="h-24 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300" />
            </div>
          </div>
        </div>
      </div>
    );
}