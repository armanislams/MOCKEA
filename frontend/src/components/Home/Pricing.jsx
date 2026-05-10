export const Pricing = () => {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            Pricing & Plans
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Choose the plan that fits your learning pace
          </h2>
        </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* free */}
          <div className="rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-900 mb-4">
              Free
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <h6 className="text-xl font-bold text-gray-700 mb-5">$0<span className="text-sm font-normal text-gray-500">/mo</span></h6>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>Access to basic listening practice</li>
              <li>Sample resources and tips</li>
              <li>Limited practice tests</li>
            </ul>
            <button className="w-full rounded-full bg-primary px-6 py-3 text-white transition hover:bg-[#001f7a]">
              Get Started
            </button>
                </div>


                {/* standard */}
          <div className="rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-900 mb-4">
              Standard
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
            <h6 className="text-xl font-bold text-gray-700 mb-5">$19<span className="text-sm font-normal text-gray-500">/mo</span></h6>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>Full access to all modules</li>
              <li>Detailed performance analytics</li>
              <li>Unlimited practice tests</li>
            </ul>
            <button className="w-full rounded-full border border-primary bg-white px-6 py-3 text-primary transition hover:bg-[#e2e8f0]">
              Get Started
            </button>
                </div>
                
                {/* premium */}
          <div className="rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-900 mb-4">
              Premium
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
            <h6 className="text-xl font-bold text-gray-700 mb-5">$49<span className="text-sm font-normal text-gray-500">/mo</span></h6>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>Personalized study plans</li>
              <li>Priority feedback and coaching</li>
              <li>Exclusive exam strategies</li>
            </ul>
            <button className="w-full rounded-full bg-primary px-6 py-3 text-white transition hover:bg-[#001f7a]">
              Get Started
            </button>
          </div>
        </div>
      </div>
    ); 
}