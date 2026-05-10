import { useState, useEffect, useMemo } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure.jsx';
import useAuth from '../../../hooks/useAuth.jsx';
import { toast } from 'react-toastify';
import Loader from '../../Loader/Loader.jsx';

const Reading = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  
  const [readingSets, setReadingSets] = useState([]);
  const [selectedReadingId, setSelectedReadingId] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const getQuestionRange = (title = '') => {
    const rangeMatch = title.match(/questions?\s*(\d+)\s*-\s*(\d+)/i);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      return Number.isNaN(start) || Number.isNaN(end) ? null : { start, end };
    }

    const singleMatch = title.match(/questions?\s*(\d+)/i);
    if (singleMatch) {
      const point = Number(singleMatch[1]);
      return Number.isNaN(point) ? null : { start: point, end: point };
    }

    return null;
  };

  // Fetch reading data
  useEffect(() => {
    const fetchReading = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get('/questions');
        const fetchedSets = response?.data?.questions || [];
        const fetchedSet = fetchedSets[0] || null;
        setReadingSets(fetchedSets);
        setSelectedReadingId(fetchedSet?.readingId || '');
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
  }, [axiosSecure, user?.email]);

  const readingData = useMemo(
    () => readingSets.find((set) => set.readingId === selectedReadingId) || null,
    [readingSets, selectedReadingId]
  );

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

  const questions = readingData?.questions || [];
  const instructions = readingData?.sections || [];
  const sectionQuestionGroups = instructions.map((section) => {
    const range = getQuestionRange(section.title);
    const sectionQuestions = range
      ? questions.slice(Math.max(range.start - 1, 0), range.end)
      : [];

    return {
      ...section,
      sectionQuestions
    };
  });
  const hasSectionMapping = sectionQuestionGroups.some((group) => group.sectionQuestions.length > 0);
  const renderedQuestionGroups = hasSectionMapping
    ? sectionQuestionGroups
    : [{ title: 'Questions', content: '', sectionQuestions: questions }];

  return (
    <div className="min-h-screen bg-bc-light p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            IELTS Reading Practice
          </h1>
          <p className="text-gray-600">
            Read the passage carefully and answer all questions
          </p>
          {readingSets.length > 1 && (
            <div className="mt-4 max-w-sm">
              <label className="label px-0">
                <span className="label-text font-medium text-gray-700">Select Reading Set</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedReadingId}
                onChange={(e) => {
                  setSelectedReadingId(e.target.value);
                  setAnswers({});
                  setSubmitted(false);
                  setResult(null);
                }}
              >
                {readingSets.map((set) => (
                  <option key={set.readingId} value={set.readingId}>
                    {set.readingId}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Passage Section - 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="prose prose-sm max-w-none">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  {readingData?.passageTitle || 'Reading Passage'}
                </h2>
                <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                  {readingData?.passage || 'No passage text available.'}
                </p>
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
                  {renderedQuestionGroups.map((group, groupIndex) => (
                    <div key={group._id || group.title || groupIndex} className="space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                        <h3 className="text-base font-semibold text-blue-800 mb-1">
                          {group.title || `Instructions ${groupIndex + 1}`}
                        </h3>
                        <p className="text-sm text-blue-700">
                          {group.content || 'Answer the following questions.'}
                        </p>
                      </div>

                      {group.sectionQuestions.map((question) => {
                        const questionIndex = questions.findIndex((q) => q.id === question.id);
                        return (
                          <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="mb-3">
                              <label className="text-sm font-semibold text-blue-600 block mb-2">
                                Question {questionIndex + 1}
                              </label>
                              <p className="text-gray-800 font-medium mb-4">
                                {question.question}
                              </p>
                            </div>

                            {['multiple-choice', 'true-false'].includes(question.type) ? (
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
                              <input
                                type="text"
                                placeholder="Type your answer..."
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="input input-bordered input-sm w-full focus:input-primary"
                              />
                            )}
                          </div>
                        );
                      })}
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
                  <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
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
                    {readingData.questions && readingData.questions.map((question) => {
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
