import { auth, provider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Auth() {
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ Logged in:", user.displayName);
      alert(`Welcome ${user.displayName}!`);
    } catch (err) {
      console.error("❌ Login failed:", err);
      alert("Login error. Check the console.");
    }
  };

  return (
    <button
      onClick={login}
      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mb-4"
    >
      Login with Google
    </button>
  );
}
