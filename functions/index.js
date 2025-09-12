// functions/index.js

// ----------------- IMPORTS -----------------
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const admin = require("firebase-admin");

// ----------------- INICIALIZAÇÃO -----------------
admin.initializeApp();
const db = admin.firestore();
const app = express();

// ----------------- MIDDLEWARE -----------------
app.use(cors({ origin: true }));
app.use(express.json());

// ----------------- CONFIGURAÇÃO DO CLIENTE MERCADO PAGO -----------------
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN
});

// ----------------- ROTA PARA CRIAR PREFERÊNCIA DE PAGAMENTO -----------------
app.post("/create_preference", async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
          id: req.body.title,
          title: req.body.title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(req.body.price)
        }
      ],
      back_urls: {
        success: "https://jiu-jitsu-puro.web.app/success.html",
        failure: "https://jiu-jitsu-puro.web.app/failure.html",
        pending: "https://jiu-jitsu-puro.web.app/pending.html"
      },
      auto_return: "approved"
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    console.log("Preferência de pagamento criada com ID:", result.id);
    res.json({ id: result.id });

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
  }
});

// ----------------- ROTA DE WEBHOOK PARA CONFIRMAR PAGAMENTOS -----------------
app.post("/webhook-mercadopago", async (req, res) => {
  console.log("---------- Webhook Recebido ----------");
  const notification = req.body;

  try {
    if (notification.type === "payment") {
      const paymentId = notification.data.id;
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });

      if (paymentDetails.status === "approved") {
        console.log(`✅ Pagamento ${paymentId} APROVADO!`);

        const payerEmail = paymentDetails.payer.email;
        const planName = paymentDetails.additional_info.items[0].title;

        try {
          const userRecord = await admin.auth().getUserByEmail(payerEmail);
          const userId = userRecord.uid;

          const userDocRef = db.collection("usuarios").doc(userId);
          await userDocRef.set({
            plano: planName,
            status: "ativo",
            paymentId: paymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          console.log(`Acesso liberado para ${payerEmail} (UID: ${userId}) no plano ${planName}`);
        } catch (authError) {
          console.error(`Erro: Usuário com e-mail ${payerEmail} pagou mas não foi encontrado no Firebase Auth.`, authError);
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    res.status(500).send("Erro no servidor ao processar webhook");
  }
});

// ----------------- ROTA PARA ENVIAR NOTIFICAÇÕES -----------------
app.post("/send-notification", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Token, título e corpo são obrigatórios." });
  }

  const message = {
    notification: {
      title,
      body,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notificação enviada:", response);
    res.json({ success: true, response });
  } catch (error) {
    console.error("❌ Erro ao enviar notificação:", error);
    res.status(500).json({ error: "Falha ao enviar notificação", details: error });
  }
});

// ----------------- EXPORTA A API PARA O FIREBASE -----------------
exports.api = functions.https.onRequest(app);
