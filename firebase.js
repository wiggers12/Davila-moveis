// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  const firebaseConfig = {
  apiKey: "AIzaSyDS2Nd7av1K4sgWIa5Wjl177dsL8rbdNVA",
  authDomain: "jiu-jitsu-puro.firebaseapp.com",
  projectId: "jiu-jitsu-puro",
  storageBucket: "jiu-jitsu-puro.firebasestorage.app",
  messagingSenderId: "548698593197",
  appId: "1:548698593197:web:9ab3957b03da0d3c57b324",
  measurementId: "G-3S051XEGY7"
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
