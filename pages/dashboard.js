import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../lib/firebase';
import Navbar from '../components/Navbar';
import { saveTopic, getUserTopics } from '../lib/firestore';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('Beginner');
  const [days, setDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [topics, setTopics] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userTopics = await getUserTopics(currentUser.uid);
        setTopics(userTopics);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, depth, days }),
    });

    const data = await res.json();
    await saveTopic(user.uid, topic, data.curriculum);
    const userTopics = await getUserTopics(user.uid);
    setTopics(userTopics);

    // Reset form
    setShowNewLesson(false);
    setTopic('');
    setDepth('Beginner');
    setDays(5);
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white px-6 py-10">
        <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-xl shadow">
          <h1 className="text-3xl font-bold mb-6 text-center text-indigo-300">🎓 CurriBuilder</h1>

          {!user && (
            <div className="mb-4 text-center">
              <button
                onClick={loginWithGoogle}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Sign in with Google
              </button>
            </div>
          )}

          {user && (
            <>
              {/* Display Topics */}
              {Object.keys(topics).length > 0 && (
                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold text-indigo-400 mb-2">Your Topics</h2>
                  {Object.entries(topics).map(([topicName, info]) => (
                    <button
                      key={topicName}
                      onClick={() => router.push(`/curriculum/${encodeURIComponent(topicName)}`)}
                      className="w-full text-left bg-gray-700 p-4 rounded hover:bg-gray-600 transition"
                    >
                      <h3 className="text-lg font-bold">{topicName}</h3>
                      <div className="h-2 bg-gray-500 rounded mt-2">
                        <div
                          className="h-2 bg-green-400 rounded"
                          style={{
                            width: `${((info.progress || 0) / info.totalDays) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* New Lesson Button */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowNewLesson(!showNewLesson)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  ➕ New Lesson
                </button>
              </div>

              {/* New Lesson Form */}
              {showNewLesson && (
                <>
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
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
