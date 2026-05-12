import { forwardRef } from "react";

const RESOURCES = [
  {
    title: "Free Vocabulary E-book",
    cta: "Free E-book",
    href: "#",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    alt: "Open book and tablet on a desk",
  },
  {
    title: "10 Tips for Writing Task 2",
    cta: "Free Tip Guide",
    href: "#",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    alt: "Hand holding a fountain pen over paper",
  },
  {
    title: "Blog: Article Book Ebook",
    cta: "Free Blog Article",
    href: "#",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    alt: "Laptop on a desk with notebook and coffee",
  },
];

export const FreeResources = forwardRef((props, ref) => {
  return (
    <section className="w-full rounded-3xl bg-[#F8F9FA] px-4 py-12 sm:px-6 md:py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center md:mb-12">
          <h2 className="text-title-gray text-3xl font-bold tracking-tight md:text-4xl">
            Free Resources
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#6C757D]">
            Quick links for IELTS prep assets and helpful blog resources.
          </p>
        </header>

        <div
          ref={ref}
          className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8"
        >
          {RESOURCES.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            >
              <div className="aspect-4/3 w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-full w-full object-cover grayscale"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-3 p-5 text-left">
                <h3 className="text-title-gray text-lg font-semibold">
                  {item.title}
                </h3>
                <a
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#D93025] underline-offset-4 transition hover:underline"
                >
                  {item.cta}
                  <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});

FreeResources.displayName = "FreeResources";
