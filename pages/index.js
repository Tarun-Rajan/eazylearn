import { useState, useEffect } from 'react';
import { auth, provider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // toggle between login and signup
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-300">Welcome to CurriBuilder</h1>

        <input
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded mb-4"
          onClick={handleEmailAuth}
        >
          {isLogin ? 'Login with Email' : 'Sign Up with Email'}
        </button>

        <button
          className="w-full bg-red-600 hover:bg-red-700 p-3 rounded mb-4"
          onClick={handleGoogleLogin}
        >
          Sign In with Google
        </button>

        <p className="text-sm text-center text-gray-400 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'No account? Sign up' : 'Already have an account? Log in'}
        </p>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </main>
  );
}
