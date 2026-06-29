import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { Link, useLocation } from "react-router";

const Footer = () => {
  const location = useLocation();
  const isPte = location.pathname.startsWith("/pte");

  const brandText = isPte
    ? "Your real PTE Academic experience. Practice smarter with guided modules, instant feedback, and enabling skill metrics."
    : "Your real IELTS experience. Practice smarter with guided modules, instant feedback, and expert support.";

  const newsletterText = isPte
    ? "Get updates, study tips, and new PTE resources delivered to your inbox."
    : "Get updates, study tips, and new IELTS resources delivered to your inbox.";

  return (
    <footer className="bg-[#001f7a] text-white mt-15">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <Link
              to={isPte ? "/pte" : "/"}
              className=" cursor-pointer select-none group focus:outline-none"
            >
              <img
                src="/logoFooter.png"
                alt="MOCKEA Logo"
                className="h-12 w-auto md:h-14 object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 active:scale-95"
              />
            </Link>
            <p className="text-gray-200 max-w-md">
              {brandText}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200 mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-gray-200">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/free-resources"
                    className="hover:text-white transition-colors"
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200 mb-4">
                Support
              </h3>
              <ul className="space-y-3 text-gray-200">
                <li>
                  <a
                    href="mailto:support@mockea.com"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@mockea.com"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
              Newsletter
            </h3>
            <p className="text-gray-200">
              {newsletterText}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.elements.email.value;
                if (email) {
                  window.open(
                    `mailto:support@mockea.com?subject=Newsletter Subscription&body=Please add me to the newsletter: ${email}`,
                    "_blank",
                  );
                  e.target.reset();
                }
              }}
              className="flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                aria-label="Email address for newsletter"
                className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-200 outline-none focus:border-white focus:ring-2 focus:ring-white/25"
              />
              <button
                type="submit"
                className={`rounded-full px-6 py-3 font-semibold text-white transition ${
                  isPte ? "bg-blue-600 hover:bg-blue-700" : "bg-cta-btn hover:bg-red-600"
                }`}
              >
                Subscribe
              </button>
            </form>
            <div className="flex items-center gap-4 text-gray-200">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-white transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-white transition-colors"
              >
                <FaLinkedinIn className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-gray-300 text-center">
          &copy; {new Date().getFullYear()} Mockea. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
