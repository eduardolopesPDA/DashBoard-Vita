

// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAg0bSoGKHyK4cbail_ilXZbxmVX0aYDKc",
  authDomain: "dashboard-vita-ambiental-dbe65.firebaseapp.com",
  projectId: "dashboard-vita-ambiental-dbe65",
  storageBucket: "dashboard-vita-ambiental-dbe65.firebasestorage.app",
  messagingSenderId: "659267106569",
  appId: "1:659267106569:web:240ac37b99b9c3c79485d8"
};
  
// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para ser usado em outros arquivos
export const db = getFirestore(app);


  