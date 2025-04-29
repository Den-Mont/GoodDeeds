import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 🔧 Initialize services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Register user
const registerWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name: name || "Anonymous",
      bio: "",
      profilePic: "/default-avatar.png",
      karma: 0,
    });

    return user;
  } catch (error) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
};

// ✅ Log in with email
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
};

// ✅ Log in with Google
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "Google User",
        bio: "",
        profilePic: user.photoURL || "/default-avatar.png",
        karma: 0,
      });
    }

    return user;
  } catch (error) {
    console.error("Google Auth error:", error.code, error.message);
    throw error;
  }
};

// ✅ Log out
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error.code, error.message);
    throw error;
  }
};

// ✅ Get profile
const getUserProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// ✅ Upload avatar
const uploadProfilePicture = async (userId, file) => {
  try {
    const storageRef = ref(storage, `profile_pictures/${userId}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return null;
  }
};

// ✅ Save profile
const saveUserProfile = async (userId, name, bio, profilePic) => {
  try {
    await setDoc(doc(db, "users", userId), { name, bio, profilePic }, { merge: true });
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

// ✅ 🔥 Publish task
const publishTask = async ({ userId, title, details, context, reward, tags }) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      userId,
      title,
      details,
      context,
      reward,
      tags,
      createdAt: serverTimestamp(),
      completed: false,
    });
    console.log("Task published:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error publishing task:", error);
    throw error;
  }
};

// ✅ 📥 Fetch all tasks
const fetchAllTasks = async () => {
  try {
    const snapshot = await getDocs(collection(db, "tasks"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// ✅ ❌ Delete task
const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    console.log("Task deleted:", taskId);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// ✅ ✅ Mark task as complete
const markTaskComplete = async (taskId) => {
  try {
    await updateDoc(doc(db, "tasks", taskId), { completed: true });
    console.log("Task marked complete:", taskId);
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

// ✅ Exports
export {
  auth,
  db,
  storage,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  getUserProfile,
  uploadProfilePicture,
  saveUserProfile,
  publishTask,
  fetchAllTasks,
  deleteTask,
  markTaskComplete,
};