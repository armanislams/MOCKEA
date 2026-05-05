import Navbar from './Navbar';
import { FaRegClock, FaListUl, FaGraduationCap } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      
      <main className="grow">
        {/* Hero Section */}
        <section className="bg-bc-navy text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                IELTS Academic Listening Practice Evaluation
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience a realistic IELTS listening environment. Improve your comprehension and typing skills with our interactive module designed to simulate the official test conditions.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => document.getElementById('practice-section').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-bc-navy hover:bg-gray-100 px-8 py-3 rounded-md font-bold text-lg transition-colors shadow-lg"
                >
                  Start Practice
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-[#0028a1] px-8 py-3 rounded-md font-bold text-lg transition-colors">
                  View Test Format
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0028a1]">About the Listening Module</h2>
              <div className="w-16 h-1 bg-[#0028a1] mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Info Card 1 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-[#0028a1] rounded-lg flex items-center justify-center mb-6">
                  <FaRegClock size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Timing</h3>
                <p className="text-gray-600 leading-relaxed">
                  The listening test takes approximately 30 minutes. You will hear the recording only once, so sustained concentration is essential.
                </p>
              </div>

              {/* Info Card 2 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-[#0028a1] rounded-lg flex items-center justify-center mb-6">
                  <FaListUl size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Format</h3>
                <p className="text-gray-600 leading-relaxed">
                  There are four parts with 10 questions each. The questions are designed so that the answers appear in the order they are heard.
                </p>
              </div>

              {/* Info Card 3 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-[#0028a1] rounded-lg flex items-center justify-center mb-6">
                  <FaGraduationCap size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Evaluation Criteria</h3>
                <p className="text-gray-600 leading-relaxed">
                  You will be assessed on your ability to understand main ideas, detailed factual information, and the opinions of speakers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Task Section */}
        <section id="practice-section" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="mb-10 border-l-4 border-[#0028a1] pl-6">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Practice Task: Transcription
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl">
                Listen to the audio recording below and type exactly what you hear in the provided text area. Make sure to check your spelling and grammar before submitting.
              </p>
            </div>

           
            
          </div>
        </section>
      </main>
      
      {/* Footer */}
      
    </div>
  );
};

export default Home;