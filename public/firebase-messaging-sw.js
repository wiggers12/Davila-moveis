// Importa Firebase
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDS2Nd7av1K4sgWIa5Wjl177dsL8rbdNVA",
  authDomain: "jiu-jitsu-puro.firebaseapp.com",
  projectId: "jiu-jitsu-puro",
  storageBucket: "jiu-jitsu-puro.firebasestorage.app",
  messagingSenderId: "548698593197",
  appId: "1:548698593197:web:9ab3957b03da0d3c57b324",
  measurementId: "G-3S051XEGY7"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa Messaging
const messaging = firebase.messaging();

// Listener de mensagens recebidas em background
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Mensagem recebida em background: ", payload);

  const notificationTitle = payload.notification?.title || "Notificação";
  const notificationOptions = {
    body: payload.notification?.body || "Você tem uma nova mensagem.",
    icon: "/icons/icon-192x192.png" // ajuste conforme seus ícones no public/
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
