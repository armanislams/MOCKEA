const Footer =()=>{
    return (
        <footer className="bg-[#0028a1] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-blue-800 pb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">ECO STREAM</h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                A modern platform to practice and evaluate your listening comprehension skills for academic purposes.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Test Format</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preparation Tips</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-blue-300 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} Eco Stream. Not affiliated with any official British Council.</p>
            <p className="mt-2 md:mt-0">Designed for UI/UX Evaluation</p>
          </div>
        </div>
      </footer>
    )
}

export default Footer