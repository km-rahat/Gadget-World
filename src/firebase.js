// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB79VeRFPNFWFdxGl2-2dnOnHPIL6j0BpE",
  authDomain: "gadget-world-fa1ec.firebaseapp.com",
  projectId: "gadget-world-fa1ec",
  storageBucket: "gadget-world-fa1ec.firebasestorage.app",
  messagingSenderId: "979259759911",
  appId: "1:979259759911:web:b84a2af493e4c54048dd02",
  measurementId: "G-9BXE8QF16X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
