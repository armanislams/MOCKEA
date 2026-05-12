const pricingPlans = [
  {
    id: "free",
    name: "Free",
    subtitle: "Start Using",
    price: "Free",
    duration: "Unlimited",
    features: ["Sample Tests"],
    isPopular: false,
    secondaryCta: "Get Started",
  },
  {
    id: "standard",
    name: "Standard",
    subtitle: "Start Prying",
    price: "$19",
    duration: "30 days",
    features: ["Full access for 30 days", "2 speaking Mock Interviews"],
    isPopular: false,
    secondaryCta: "Get Started",
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Unlimited Success",
    price: "$49",
    duration: "90 days",
    features: ["Full access for 90 days", "5 speaking mock Interviews", "Unlimited Premium Features", "24/7 Academic Support"],
    isPopular: true,
    secondaryCta: "Get Started",
  },
];

export const Pricing = () => {
  return (
    <section className="bg-white px-4 py-14 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-4xl font-extrabold text-[#000f38]">
          Pricing & Plans
        </h2>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                plan.isPopular ? "border-cta-btn" : "border-[#d6dde9]"
              }`}
            >
              <div className="relative bg-[#000f38] px-6 pb-6 pt-8 text-center text-white">
                {plan.isPopular && (
                  <span className="absolute right-0 top-0 rounded-bl-md bg-cta-btn px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                )}

                <h3 className="text-3xl font-extrabold">{plan.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f7dbf]">
                  {plan.subtitle}
                </p>

                <button className="mt-6 w-full rounded-md bg-cta-btn py-2.5 text-sm font-medium text-white transition hover:opacity-90">
                  {plan.price} {plan.id !== "free" && <span>/ months</span>}
                </button>
              </div>

              <div className="px-6 pb-6 pt-5">
                <ul className="space-y-3 text-sm text-[#1a1a1a]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="mt-[2px] text-cta-btn ">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-6 w-full rounded-md border py-2.5 text-sm font-medium transition ${
                    plan.isPopular
                      ? "border-cta-btn bg-cta-btn text-white hover:opacity-90"
                      : "border-cta-btn bg-white text-cta-btn hover:bg-red-50"
                  }`}
                >
                  {plan.secondaryCta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};