import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDeC4UOYuIx0cK3k7nBWMt5W4kaU0D3DzE",
  authDomain: "curribuilder-dd52f.firebaseapp.com",
  projectId: "curribuilder-dd52f",
  storageBucket: "curribuilder-dd52f.firebasestorage.app",
  messagingSenderId: "816079639698",
  appId: "1:816079639698:web:6e0336a9734e0be539c24b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
