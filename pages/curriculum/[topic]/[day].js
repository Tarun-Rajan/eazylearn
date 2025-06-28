import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserTopics, updateProgress } from '../../../lib/firestore';
import Navbar from '../../../components/Navbar';
import confetti from 'canvas-confetti';

export default function DayPage() {
  const router = useRouter();
  const { topic, day } = router.query;
  const dayIndex = parseInt(day);
  const [user, setUser] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return router.push('/');
      setUser(user);
      const data = await getUserTopics(user.uid);
      if (data[topic]) {
        setCurriculum(data[topic].curriculum);
        setProgress(data[topic].progress || 0);
      }
    });
    return () => unsub();
  }, [topic, day]);

  const current = curriculum[dayIndex];
  if (!current) return null;

  const allDone = current.mcqs.length > 0 && Object.keys(answers).length === current.mcqs.length;

  const handleAnswer = (i, letter) => {
    const correct = current.mcqs[i].answer;
    setAnswers(prev => ({ ...prev, [i]: { selected: letter, correct } }));
  };

  const handleNext = async () => {
    const newProgress = Math.max(progress, dayIndex + 1);
    await updateProgress(user.uid, topic, newProgress);
    router.push(`/curriculum/${topic}`);
  };

  const handleFinish = async () => {
    const newProgress = Math.max(progress, dayIndex + 1);
    await updateProgress(user.uid, topic, newProgress);
    setShowCongrats(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    new Audio('/success.mp3').play();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-2xl text-indigo-300 font-bold">Day {dayIndex + 1}: {current.title}</h1>
          <p>{current.explanation}</p>
          <a href={current.resource} target="_blank" rel="noreferrer" className="text-blue-400 underline">📘 View Resource</a>

          {current.mcqs.map((mcq, i) => {
            const selected = answers[i]?.selected;
            const correct = answers[i]?.correct;
            return (
              <div key={i}>
                <p>{mcq.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {mcq.options.map((opt, oi) => {
                    const letter = opt.trim().charAt(0);
                    const isSelected = selected === letter;
                    const isCorrect = correct === letter;
                    let bg = 'bg-gray-600';
                    if (selected) {
                      if (isCorrect) bg = 'bg-green-600';
                      else if (isSelected) bg = 'bg-red-600';
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => handleAnswer(i, letter)}
                        disabled={!!selected}
                        className={`p-2 rounded ${bg}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <p className="text-sm mt-1">
                    {selected === correct ? '✔️ Correct' : `❌ Correct: ${correct}`}
                  </p>
                )}
              </div>
            );
          })}

          {allDone && dayIndex < curriculum.length - 1 && (
            <button onClick={handleNext} className="w-full bg-indigo-600 py-2 rounded">Next Day →</button>
          )}
          {allDone && dayIndex === curriculum.length - 1 && (
            <button onClick={handleFinish} className="w-full bg-green-600 py-2 rounded">Finish Topic 🎉</button>
          )}
          {!allDone && (
            <p className="text-red-400 text-sm">❗ Answer all questions to proceed.</p>
          )}

          <button
            onClick={() => router.push(`/curriculum/${topic}`)}
            className="mt-4 w-full bg-gray-700 py-2 rounded"
          >
            ⬅️ Back to Days
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-2 w-full bg-gray-500 py-2 rounded"
          >
            ⬅️ Dashboard
          </button>
        </div>
      </main>

      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2">🎉 You did it!</h2>
            <p className="mb-4">You’ve completed <strong>{topic}</strong>.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 text-white py-2 px-6 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
