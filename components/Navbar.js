import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        const firstName = user.email.split('@')[0].replace(/[0-9]/g, '').replace(/^k/, '');
        setName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
      }
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Hi, {name || 'Learner'}</h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
      >
        Logout
      </button>
    </nav>
  );
}
