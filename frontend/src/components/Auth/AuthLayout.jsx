import { motion } from 'framer-motion';
import { Outlet } from 'react-router';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';

  const features = [
    {
      title: 'Full-length mock tests',
      description: 'Practice with realistic exam conditions'
    },
    {
      title: 'Instant band estimates',
      description: 'Know your score immediately'
    },
    {
      title: 'Detailed analytics',
      description: 'Track progress and identify weak areas'
    }
  ];

const AuthLayout = () => {
  return (
    <>
    <Navbar/>
<div className="min-h-[calc(100vh-64px)] flex items-center py-4">
      {/* Left side - Hero Section (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-bc-navy text-white p-12 flex-col justify-between rounded-2xl ml-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Join 50,000+ students achieving their IELTS goals
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            Master English with our comprehensive learning platform
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-white/20 backdrop-blur">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  {/* <h3 className="text-lg font-bold mb-1">{feature.title}</h3> */}
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Outlet/>
        </motion.div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default AuthLayout;
