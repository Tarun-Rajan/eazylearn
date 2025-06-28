import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserTopics } from '../../../lib/firestore';
import Navbar from '../../../components/Navbar';

export default function TopicOverviewPage() {
  const router = useRouter();
  const { topic } = router.query;
  const [user, setUser] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');
      setUser(user);
      const data = await getUserTopics(user.uid);
      if (data[topic]) {
        setCurriculum(data[topic].curriculum);
        setProgress(data[topic].progress || 0);
      }
    });
    return () => unsub();
  }, [topic]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-3xl text-indigo-300 font-bold text-center">
            {topic?.toUpperCase()} – Progress: {progress}/{curriculum.length}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            {curriculum.map((_, i) => (
              <button
                key={i}
                disabled={i > progress}
                onClick={() => router.push(`/curriculum/${topic}/${i}`)}
                className={`p-4 rounded ${
                  i > progress
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Day {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
          >
            ⬅️ Back to Dashboard
          </button>
        </div>
      </main>
    </>
  );
}
