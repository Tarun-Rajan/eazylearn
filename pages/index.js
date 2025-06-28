import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('Beginner');
  const [days, setDays] = useState(5);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showCongrats, setShowCongrats] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCurriculum([]);
    setCurrentDay(0);
    setSelectedAnswers({});
    setShowCongrats(false);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, depth, days }),
    });

    const data = await res.json();
    setCurriculum(data.curriculum);
    setLoading(false);
  };

  const handleAnswer = (qIndex, selected) => {
    const correct = curriculum[currentDay].mcqs[qIndex].answer;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: { selected, correct },
    }));
  };

  const current = curriculum[currentDay];

  const allAnswered = current?.mcqs?.length > 0 &&
    Object.keys(selectedAnswers).length === current.mcqs.length;

  const playCelebration = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      confetti(Object.assign({}, defaults, {
        particleCount: 50 * (timeLeft / duration),
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      }));
    }, 250);

    const audio = new Audio('/success.mp3');
    audio.play();
  };

  useEffect(() => {
    if (showCongrats) playCelebration();
  }, [showCongrats]);

  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-300">🎓 CurriBuilder</h1>

        <input
          type="text"
          placeholder="Enter a topic (e.g., React Basics)"
          className="w-full p-3 border mb-4 rounded bg-gray-700 text-white placeholder-gray-400"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <select
          className="w-full p-3 border mb-4 rounded bg-gray-700 text-white"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <input
          type="number"
          min={1}
          max={30}
          className="w-full p-3 border mb-4 rounded bg-gray-700 text-white"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          placeholder="Number of days to learn"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
        >
          {loading ? 'Generating...' : 'Generate Curriculum'}
        </button>

        {curriculum.length > 0 && current && (
          <div className="mt-6 space-y-4">
            <div className="p-4 border rounded bg-gray-700">
              <h2 className="text-xl font-bold mb-2 text-indigo-300">
                Day {current.day}: {current.title}
              </h2>
              <p className="mb-2 text-sm">{current.explanation}</p>
              <a
                href={current.resource.match(/https?:\/\/\S+/)?.[0]}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline text-sm"
              >
                📚 Resource
              </a>

              <div className="mt-4 space-y-6">
                {current.mcqs.map((mcq, qIndex) => {
                  const selected = selectedAnswers[qIndex]?.selected;
                  const correct = selectedAnswers[qIndex]?.correct;

                  return (
                    <div key={qIndex}>
                      <p className="font-medium mb-2">{mcq.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {mcq.options.map((option, optIndex) => {
                          const letter = option.trim().charAt(0);
                          const isSelected = selected === letter;
                          const isCorrect = correct === letter;
                          const show = selectedAnswers[qIndex];

                          let bg = 'bg-gray-600 hover:bg-gray-500';
                          if (show) {
                            if (isCorrect) bg = 'bg-green-600 border-green-400 text-white';
                            else if (isSelected) bg = 'bg-red-600 border-red-400 text-white';
                            else bg = 'bg-gray-700';
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleAnswer(qIndex, letter)}
                              className={`p-2 border rounded text-sm text-left ${bg}`}
                              disabled={show}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {selectedAnswers[qIndex] && (
                        <p className="text-sm mt-2">
                          {selected === correct ? (
                            <span className="text-green-400">✔ Correct</span>
                          ) : (
                            <span className="text-red-400">
                              ✘ Incorrect. Correct answer: <strong>{correct}</strong>
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {currentDay < curriculum.length - 1 && allAnswered && (
              <button
                onClick={() => {
                  setCurrentDay((prev) => prev + 1);
                  setSelectedAnswers({});
                }}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Next Day →
              </button>
            )}

            {currentDay < curriculum.length - 1 && !allAnswered && (
              <p className="text-sm text-red-400 text-center">
                ❗ Please answer all MCQs to proceed.
              </p>
            )}

            {currentDay === curriculum.length - 1 && allAnswered && (
              <button
                onClick={() => setShowCongrats(true)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Finish Plan 🎉
              </button>
            )}
          </div>
        )}
      </div>

      {/* CELEBRATION MODAL */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl text-center shadow-lg relative w-[90%] max-w-md">
            <h2 className="text-3xl font-bold mb-4">🎉 Congratulations!</h2>
            <p className="mb-4 text-lg">You've completed your {days}-day personalized learning plan!</p>
            <button
              onClick={() => setShowCongrats(false)}
              className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
