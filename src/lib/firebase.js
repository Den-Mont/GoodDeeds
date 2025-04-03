import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Register User & Save Profile Data
const registerWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name || "Anonymous",
      bio: "",
      profilePic: "/default-avatar.png", // Default avatar
      karma: 0, // Initial karma points
    });

    console.log("User registered:", user);
    return user;
  } catch (error) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
};

// ✅ Login User
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
};

// ✅ Login with Google & Save User Data
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user already exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // If new user, create a profile
      await setDoc(userRef, {
        name: user.displayName || "Google User",
        bio: "",
        profilePic: user.photoURL || "/default-avatar.png",
        karma: 0,
      });
    }

    console.log("User logged in with Google:", user);
    return user;
  } catch (error) {
    console.error("Google Auth error:", error.code, error.message);
    throw error;
  }
};

// ✅ Logout User
const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error.code, error.message);
    throw error;
  }
};

// ✅ Fetch User Profile from Firestore
const getUserProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// ✅ Upload Profile Picture to Firebase Storage
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

// ✅ Save Updated User Profile
const saveUserProfile = async (userId, name, bio, profilePic) => {
  try {
    await setDoc(doc(db, "users", userId), { name, bio, profilePic }, { merge: true });
    console.log("Profile updated");
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

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
  saveUserProfile 
};