import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer =()=>{
    return (
      <footer className="bg-[#001f7a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-2xl font-bold">Mockea</div>
              <p className="text-gray-200 max-w-md">
                Your real IELTS experience. Practice smarter with guided
                modules, instant feedback, and expert support.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200 mb-4">
                  Product
                </h3>
                <ul className="space-y-3 text-gray-200">
                  <li>About</li>
                  <li>Features</li>
                  <li>Pricing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200 mb-4">
                  Resources
                </h3>
                <ul className="space-y-3 text-gray-200">
                  <li>Blog</li>
                  <li>Help Center</li>
                  <li>Newsletter</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                Newsletter
              </h3>
              <p className="text-gray-200">
                Get updates, study tips, and new IELTS resources delivered to
                your inbox.
              </p>
              <div className="flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-200 outline-none focus:border-white focus:ring-2 focus:ring-white/25"
                />
                <button className="rounded-full bg-cta-btn px-6 py-3 font-semibold text-white transition hover:bg-red-600">
                  Subscribe
                </button>
              </div>
              <div className="flex items-center gap-4 text-gray-200">
                <FaFacebookF className="h-5 w-5" />
                <FaTwitter className="h-5 w-5" />
                <FaLinkedinIn className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-sm text-gray-300 text-center">
            © 2026 Mockea. All rights reserved.
          </div>
        </div>
      </footer>
    );
}

export default Footer