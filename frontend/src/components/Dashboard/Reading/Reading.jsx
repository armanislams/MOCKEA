import { useState, useEffect } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure.jsx';
import useAuth from '../../../hooks/useAuth.jsx';
import { toast } from 'react-toastify';
import Loader from '../../Loader/Loader.jsx';

const Reading = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  
  const [readingData, setReadingData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch reading data
  useEffect(() => {
    const fetchReading = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get('/reading/reading-001');
        setReadingData(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load reading');
        console.log(error);
        
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchReading();
    }
  }, [user]);

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all answers are filled
    if (!readingData || Object.keys(answers).length !== readingData.questions.length) {
      toast.warning('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);
      
      //answers for submission
      const formattedAnswers = readingData.questions.map(q => ({
        questionId: q.id,
        userAnswer: answers[q.id]
      }));

      const response = await axiosSecure.post('/reading/submit', {
        email: user.email,
        readingId: readingData.readingId,
        answers: formattedAnswers
      });

      if (response.data.success) {
        setResult(response.data);
        setSubmitted(true);
        toast.success('Answers submitted successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader/>
  }

  if (!readingData) {
    return (
      <div className="alert alert-error">
        <span>Failed to load reading content</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            IELTS Reading Practice
          </h1>
          <p className="text-gray-600">
            Read the passage carefully and answer all questions
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Passage Section - 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="prose prose-sm max-w-none">
                {/* Passage Sections */}
                <div className="space-y-6">
                  {readingData.sections && readingData.sections.map((section, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {section.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-justify">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable Container Info */}
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Scroll down to see questions or use the Questions Panel →</p>
              </div>
            </div>
          </div>

          {/* Question Panel - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 max-h-[calc(100vh-40px)] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Questions</h2>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Questions */}
                  {readingData.questions && readingData.questions.map((question, index) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="mb-3">
                        <label className="text-sm font-semibold text-blue-600 block mb-2">
                          Question {index + 1}
                        </label>
                        <p className="text-gray-800 font-medium mb-4">
                          {question.question}
                        </p>
                      </div>

                      {/* MCQ Options */}
                      {question.type === 'mcq' ? (
                        <div className="space-y-3">
                          {question.options && question.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center cursor-pointer group">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="radio radio-sm radio-primary mr-3"
                              />
                              <span className="text-gray-700 text-sm group-hover:text-blue-600 transition">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        /* Short Answer Input */
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="input input-bordered input-sm w-full focus:input-primary"
                        />
                      )}
                    </div>
                  ))}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary w-full mt-6"
                  >
                    {submitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Answers'
                    )}
                  </button>
                </form>
              ) : (
                /* Results Display */
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
                    <h3 className="text-lg font-semibold mb-2">Your Score</h3>
                    <p className="text-4xl font-bold mb-2">
                      {result?.score}%
                    </p>
                    <p className="text-sm text-blue-100">
                      {result?.correctAnswers} of {result?.totalQuestions} correct
                    </p>
                  </div>

                  {/* Answer Review */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Answer Review</h3>
                    {readingData.questions && readingData.questions.map((question, index) => {
                      const userAnswer = answers[question.id];
                      const evaluation = result?.evaluatedAnswers.find(a => a.questionId === question.id);
                      
                      return (
                        <div
                          key={question.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            evaluation?.isCorrect
                              ? 'bg-green-50 border-green-500'
                              : 'bg-red-50 border-red-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-semibold ${
                              evaluation?.isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {evaluation?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 mb-1">
                            <strong>Your answer:</strong> {userAnswer}
                          </p>
                          {!evaluation?.isCorrect && (
                            <p className="text-xs text-gray-700">
                              <strong>Correct answer:</strong> {question.correctAnswer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setAnswers({});
                      setResult(null);
                      window.scrollTo(0, 0);
                    }}
                    className="btn btn-outline w-full"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reading;
