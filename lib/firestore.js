import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Save a user's topic and curriculum to Firestore
 */
export async function updateProgress(uid, topicName, newProgress) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  data.topics[topicName].progress = newProgress;
  await setDoc(ref, data);
}

export async function saveTopic(uid, topicName, curriculum) {
  const ref = doc(db, 'users', uid);
  const userDoc = await getDoc(ref);

  const userData = userDoc.exists() ? userDoc.data() : {};

  const newData = {
    ...userData,
    topics: {
      ...(userData.topics || {}),
      [topicName]: {
        curriculum,
        progress: 0,
        totalDays: curriculum.length,
      }
    }
  };

  await setDoc(ref, newData);
}

/**
 * Get all topics for a user
 */
export async function getUserTopics(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().topics || {} : {};
}
