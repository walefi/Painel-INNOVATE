import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBTTH5bA3MQilCuezzfpLk_yV9bJubrWxU",
  authDomain: "painel-innovate.firebaseapp.com",
  projectId: "painel-innovate",
  storageBucket: "painel-innovate.firebasestorage.app",
  messagingSenderId: "326924541260",
  appId: "1:326924541260:web:c5003caab57de9338883e9"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
