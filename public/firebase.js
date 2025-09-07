// firebase.js

// Importa os módulos Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Sua configuração do Firebase (está correta)
const firebaseConfig = {
  apiKey: "AIzaSyDS2Nd7av1K4sgWIa5Wjl177dsL8rbdNVA",
  authDomain: "jiu-jitsu-puro.firebaseapp.com",
  projectId: "jiu-jitsu-puro",
  storageBucket: "jiu-jitsu-puro.firebasestorage.app",
  messagingSenderId: "548698593197",
  appId: "1:548698593197:web:9ab3957b03da0d3c57b324",
  measurementId: "G-3S051XEGY7"
};

// Inicializa e EXPORTA os serviços Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Função de login com Google
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Garante que o usuário tem um registro no Firestore ao logar pela 1ª vez
    // Usaremos a estrutura padronizada
    const userDocRef = doc(db, "usuarios", user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      nome: user.displayName,
      status: "pendente", // O status inicial é sempre pendente
      plano: null
    }, { merge: true }); // Merge true para não apagar dados se já existir

    return user;
  } catch (e) {
    console.error("Erro no login Google:", e);
    return null;
  }
}