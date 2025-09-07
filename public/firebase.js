// firebase.js

// Importa os módulos Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// Adicionamos o 'getDoc' aqui para podermos LER um documento
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Função de login com Google (LÓGICA CORRIGIDA)
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // --- INÍCIO DA CORREÇÃO ---
    // 1. Primeiro, criamos uma referência ao documento do usuário
    const userDocRef = doc(db, "usuarios", user.uid);
    // 2. Em seguida, tentamos ler esse documento
    const userDocSnap = await getDoc(userDocRef);

    // 3. Apenas criamos o registro inicial se o documento NÃO existir
    if (!userDocSnap.exists()) {
      console.log("Primeiro login do usuário via Google. Criando registro no Firestore.");
      await setDoc(userDocRef, {
        email: user.email,
        nome: user.displayName,
        status: "pendente", // O status inicial é sempre pendente
        plano: null
      });
    } else {
      // Se o documento já existe, não fazemos nada, preservando o status atual ('ativo' ou 'pendente').
      console.log("Usuário já existente fez login. Status preservado.");
    }
    // --- FIM DA CORREÇÃO ---

    return user;
  } catch (e) {
    // Melhoria para não mostrar erro quando o usuário simplesmente fecha o popup
    if (e.code === 'auth/popup-closed-by-user') {
      console.log("Login com Google cancelado pelo usuário.");
    } else {
      console.error("Erro no login Google:", e);
    }
    return null;
  }
}