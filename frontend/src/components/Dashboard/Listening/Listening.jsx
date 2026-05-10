import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeadphones, FaClock, FaCheckCircle, FaArrowRight, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../../../hooks/useAuth';

/* ── Static question data (swap for DB fetch later) ── */
const SECTIONS = [
  {
    id: 'section-1',
    title: 'Section 1',
    subtitle: 'Questions 1–10',
    description: 'You will hear a conversation between two friends catching up. Listen carefully and answer the questions below.',
    instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
    questions: [
      { id: 'q1', number: 1, type: 'fill', question: 'Where does the conversation take place?', correctAnswer: 'coffee shop' },
      { id: 'q2', number: 2, type: 'fill', question: 'How long has it been since the speakers last met?', correctAnswer: 'six months' },
      { id: 'q3', number: 3, type: 'fill', question: 'What is the female speaker\'s new job title?', correctAnswer: 'project manager' },
      { id: 'q4', number: 4, type: 'mcq', question: 'What does the male speaker plan to do next year?',
        options: ['A) Travel abroad', 'B) Start a business', 'C) Go back to university', 'D) Move to another city'],
        correctAnswer: 'A) Travel abroad' },
      { id: 'q5', number: 5, type: 'fill', question: 'What hobby did the female speaker recently start?', correctAnswer: 'painting' },
      { id: 'q6', number: 6, type: 'mcq', question: 'How does the male speaker feel about his current job?',
        options: ['A) Very satisfied', 'B) Somewhat bored', 'C) Extremely stressed', 'D) Indifferent'],
        correctAnswer: 'B) Somewhat bored' },
      { id: 'q7', number: 7, type: 'fill', question: 'What event are they planning to attend together?', correctAnswer: 'music festival' },
      { id: 'q8', number: 8, type: 'fill', question: 'When is the event scheduled?', correctAnswer: 'next Saturday' },
      { id: 'q9', number: 9, type: 'mcq', question: 'Who else will join them at the event?',
        options: ['A) Their colleague Mark', 'B) The female speaker\'s sister', 'C) A group of old school friends', 'D) Nobody else'],
        correctAnswer: 'C) A group of old school friends' },
      { id: 'q10', number: 10, type: 'fill', question: 'What time do they agree to meet?', correctAnswer: '10 am' },
    ],
  },
];

const AUDIO_URL = 'https://uploads.teachablecdn.com/attachments/onaBYdQGS6WkAARio4XR_Catching+Up+With+Friends+Audio+2.mp3';

/* ── Helpers ── */
const fmt = (s) => {
  if (!s || isNaN(s)) return '00:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const Listening = () => {
  const { user } = useAuth();

  /* ── Howler refs ── */
  const howlRef = useRef(null);
  const rafRef = useRef(null);

  /* ── Audio state ── */
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* ── Test state ── */
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [highlightedQ, setHighlightedQ] = useState(null);

  const progressBarRef = useRef(null);
  const section = SECTIONS[currentSection];

  /* ── Initialise Howl ── */
  useEffect(() => {
    const sound = new Howl({
      src: [AUDIO_URL],
      html5: true,
      preload: true,
      volume: volume,
      onload: () => {
        setIsLoaded(true);
        setDuration(sound.duration());
      },
      onend: () => {
        setIsPlaying(false);
        cancelAnimationFrame(rafRef.current);
      },
      onloaderror: (_id, err) => {
        console.error('Howler load error:', err);
        toast.error('Failed to load audio file.');
      },
    });
    howlRef.current = sound;

    return () => {
      cancelAnimationFrame(rafRef.current);
      sound.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── RAF loop for smooth progress ── */
  const tick = useCallback(() => {
    const sound = howlRef.current;
    if (sound && sound.playing()) {
      const seek = sound.seek() || 0;
      setCurrentTime(seek);
      setDuration(sound.duration());
      setProgress(sound.duration() ? (seek / sound.duration()) * 100 : 0);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  /* ── Elapsed timer ── */
  useEffect(() => {
    if (!testStarted) return;
    const iv = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(iv);
  }, [testStarted]);

  /* ── Audio controls ── */
  const togglePlay = () => {
    const sound = howlRef.current;
    if (!sound || !isLoaded) return;
    if (!testStarted) setTestStarted(true);

    if (isPlaying) {
      sound.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      sound.play();
      rafRef.current = requestAnimationFrame(tick);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const sound = howlRef.current;
    if (!sound) return;
    sound.mute(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (howlRef.current) howlRef.current.volume(v);
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const handleSeek = (e) => {
    const bar = progressBarRef.current;
    if (!bar || !howlRef.current) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    howlRef.current.seek(pct * howlRef.current.duration());
    setCurrentTime(pct * howlRef.current.duration());
    setProgress(pct * 100);
  };

  /* ── Answer handling ── */
  const handleAnswer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    setHighlightedQ(qId);
    setTimeout(() => setHighlightedQ(null), 600);
  };

  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);

  /* ── Submit ── */
  const handleSubmit = () => {
    if (answeredCount === 0) {
      toast.warning('Please answer at least one question before submitting.');
      return;
    }

    // Pause audio
    if (howlRef.current && isPlaying) {
      howlRef.current.pause();
      cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
    }

    // Score
    let correct = 0;
    const evaluated = [];
    SECTIONS.forEach((sec) => {
      sec.questions.forEach((q) => {
        const userAns = (answers[q.id] || '').trim().toLowerCase();
        const correctAns = q.correctAnswer.toLowerCase();
        const isCorrect = userAns === correctAns;
        if (isCorrect) correct++;
        evaluated.push({ questionId: q.id, userAnswer: answers[q.id] || '', correctAnswer: q.correctAnswer, isCorrect });
      });
    });

    const score = Math.round((correct / totalQuestions) * 100);
    let band = '0';
    if (score >= 90) band = '8.5–9.0';
    else if (score >= 80) band = '7.5–8.0';
    else if (score >= 70) band = '6.5–7.0';
    else if (score >= 60) band = '5.5–6.0';
    else if (score >= 50) band = '5.0';
    else if (score >= 40) band = '4.0–4.5';
    else band = '3.0–3.5';

    setResult({ score, correct, total: totalQuestions, band, evaluated });
    setSubmitted(true);
    toast.success('Answers submitted!');
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setElapsed(0);
    setTestStarted(false);
    if (howlRef.current) {
      howlRef.current.stop();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Question number pills (navigator) ── */
  const QuestionNav = () => (
    <div className="flex flex-wrap gap-2">
      {section.questions.map((q) => {
        const answered = !!answers[q.id]?.trim();
        return (
          <a
            key={q.id}
            href={`#${q.id}`}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
              ${submitted && result
                ? result.evaluated.find((e) => e.questionId === q.id)?.isCorrect
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white'
                : answered
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
              ${highlightedQ === q.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}
            `}
          >
            {q.number}
          </a>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bc-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="border-l-4 border-primary pl-5">
            <div className="flex items-center gap-3 mb-1">
              <FaHeadphones className="text-primary text-xl" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">IELTS Listening Test</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              Listening Practice
            </h1>
            <p className="text-gray-500 mt-1">Listen to the audio recording and answer the questions below.</p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 self-start md:self-auto">
            <FaClock className="text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                {testStarted && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                Time Elapsed
              </p>
              <p className="text-2xl font-mono font-extrabold text-primary tracking-tight">{fmt(elapsed)}</p>
            </div>
          </div>
        </div>

        {/* ── Audio Player Card ── */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FaHeadphones size={14} />
              </span>
              Audio Recording
            </h2>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
              {section.title}
            </span>
          </div>

          {/* Waveform / Progress */}
          <div className="mb-4">
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className="relative w-full h-3 bg-gray-100 rounded-full cursor-pointer group overflow-hidden"
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-400 mt-1.5 px-0.5">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={togglePlay}
              disabled={!isLoaded}
              className="w-12 h-12 shrink-0 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:opacity-40 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-primary/30"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              id="listening-play-btn"
            >
              {!isLoaded ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isPlaying ? (
                <FaPause size={16} />
              ) : (
                <FaPlay size={16} className="ml-0.5" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                id="listening-mute-btn"
              >
                {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 accent-primary cursor-pointer"
                id="listening-volume"
              />
            </div>

            {/* Progress badge */}
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="badge badge-outline badge-primary font-semibold gap-1">
                <FaCheckCircle size={12} />
                {answeredCount}/{totalQuestions} answered
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
            <p className="text-sm text-amber-900">
              <span className="font-bold">⚠ Test Conditions:</span> In the real IELTS exam, the recording is played <strong>ONLY ONCE</strong>. For practice, you may pause and replay. Try to listen straight through for the best preparation.
            </p>
          </div>
        </div>

        {/* ── Main Grid: Questions + Navigator ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Questions Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">{section.title}: {section.subtitle}</h2>
                <p className="text-blue-100 text-sm mt-1">{section.description}</p>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800 font-medium">
                    📝 <strong>Instructions:</strong> {section.instructions}
                  </p>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {section.questions.map((q) => {
                    const evalItem = submitted && result ? result.evaluated.find((e) => e.questionId === q.id) : null;
                    return (
                      <div
                        key={q.id}
                        id={q.id}
                        className={`p-5 rounded-xl border transition-all duration-300 scroll-mt-28
                          ${submitted
                            ? evalItem?.isCorrect
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-red-50 border-red-300'
                            : highlightedQ === q.id
                              ? 'bg-primary/5 border-primary/40 shadow-sm'
                              : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                            ${submitted
                              ? evalItem?.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                              : 'bg-primary/10 text-primary'}
                          `}>
                            {q.number}
                          </span>
                          <p className="text-gray-800 font-medium pt-1">{q.question}</p>
                        </div>

                        {q.type === 'mcq' ? (
                          <div className="ml-11 space-y-2">
                            {q.options.map((opt, i) => (
                              <label
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all
                                  ${submitted
                                    ? opt === q.correctAnswer
                                      ? 'bg-emerald-50 border-emerald-300'
                                      : answers[q.id] === opt && !evalItem?.isCorrect
                                        ? 'bg-red-50 border-red-300'
                                        : 'bg-white border-gray-200'
                                    : answers[q.id] === opt
                                      ? 'bg-primary/5 border-primary/40'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }
                                `}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                                  disabled={submitted}
                                  className="radio radio-sm radio-primary"
                                />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="ml-11">
                            <input
                              type="text"
                              placeholder="Type your answer..."
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswer(q.id, e.target.value)}
                              disabled={submitted}
                              className="input input-bordered w-full max-w-md focus:input-primary text-sm"
                            />
                          </div>
                        )}

                        {/* Show correct answer after submission */}
                        {submitted && evalItem && !evalItem.isCorrect && (
                          <div className="ml-11 mt-3 text-sm">
                            <span className="text-red-600 font-medium">Your answer: </span>
                            <span className="text-red-600">{evalItem.userAnswer || '(blank)'}</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-emerald-600 font-medium">Correct: </span>
                            <span className="text-emerald-600 font-semibold">{evalItem.correctAnswer}</span>
                          </div>
                        )}
                        {submitted && evalItem && evalItem.isCorrect && (
                          <div className="ml-11 mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <FaCheckCircle size={14} /> Correct!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
                  {!submitted ? (
                    <>
                      <p className="text-sm text-gray-400">
                        {answeredCount}/{totalQuestions} questions answered
                      </p>
                      <button
                        onClick={handleSubmit}
                        disabled={answeredCount === 0}
                        className="btn btn-primary px-8 shadow-lg shadow-primary/20 disabled:opacity-50"
                        id="listening-submit-btn"
                      >
                        Submit Answers
                        <FaArrowRight size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="btn btn-outline btn-primary px-8"
                      id="listening-reset-btn"
                    >
                      <FaRedo size={14} />
                      Take Test Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">

              {/* Score Card (visible after submit) */}
              {submitted && result && (
                <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-3">Your Result</h3>
                  <p className="text-5xl font-extrabold mb-1">{result.score}%</p>
                  <p className="text-blue-100 text-sm mb-4">{result.correct} of {result.total} correct</p>
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-xs text-blue-200 font-medium">Estimated Band Score</p>
                    <p className="text-2xl font-extrabold">{result.band}</p>
                  </div>
                </div>
              )}

              {/* Question Navigator */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Question Navigator</h3>
                <QuestionNav />
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary" /> Answered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Unanswered
                  </span>
                </div>
              </div>

              {/* Test Rules */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center text-xs">i</span>
                  Test Rules
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {[
                    { bold: 'No repeats:', text: 'In the real exam the audio plays only once.' },
                    { bold: 'Spelling matters:', text: 'Incorrect spelling costs marks.' },
                    { bold: 'Word limits:', text: 'Follow word-count instructions carefully.' },
                    { bold: 'Transfer time:', text: 'You get 10 min to transfer answers on the real test.' },
                  ].map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span><strong>{r.bold}</strong> {r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section Nav */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Sections</h3>
                <div className="space-y-2">
                  {SECTIONS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSection(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${currentSection === i
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'hover:bg-gray-50 text-gray-600 border border-transparent'}
                      `}
                    >
                      {s.title} — {s.subtitle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listening;
