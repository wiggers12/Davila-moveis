// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-rnG4cIZzEb1w_h_qmif3XPSx28ZIdaM",
  authDomain: "ecomercie-vendas.firebaseapp.com",
  projectId: "ecomercie-vendas",
  storageBucket: "ecomercie-vendas.firebasestorage.app",
  messagingSenderId: "1054540261609",
  appId: "1:1054540261609:web:90042b823220b4c73f6878",
  measurementId: "G-TNC5M9G89H"
};

// Inicializa
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Função de login
export async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Cria registro no Firestore (se ainda não existir)
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      ativo: false, // só libera após pagamento Pix
      plano: "pendente"
    }, { merge: true });

    return user;
  } catch (e) {
    console.error("Erro no login:", e);
    return null;
  }
}

// Verifica se usuário está ativo
export async function verificarAcesso(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (snap.exists() && snap.data().ativo === true) {
        callback(true, user);
      } else {
        callback(false, user);
      }
    } else {
      callback(false, null);
    }
  });
}
