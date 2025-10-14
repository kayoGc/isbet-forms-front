// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Lê as variáveis de ambiente definidas pelo Vite (VITE_*)
// Defina essas chaves em um arquivo .env local (não comitado).
const configFirebase = () => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Initialize Firebase
  initializeApp(firebaseConfig);
}

export default configFirebase;