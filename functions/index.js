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

// ----------------- CONFIG MERCADO PAGO -----------------
const client = new MercadoPagoConfig({
  accessToken: functions.config().mercadopago.token // 🔑 use firebase functions:config:set mercadopago.token="SEU_TOKEN"
});

// ----------------- CRIAR PREFERÊNCIA -----------------
app.post("/create_preference", async (req, res) => {
  try {
    const { title, price, uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID do usuário é obrigatório" });
    }

    const preferenceData = {
      items: [
        {
          id: title,
          title: title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(price)
        }
      ],
      back_urls: {
        success: "https://jiu-jitsu-puro.web.app/success.html",
        failure: "https://jiu-jitsu-puro.web.app/failure.html",
        pending: "https://jiu-jitsu-puro.web.app/pending.html"
      },
      auto_return: "approved",
      external_reference: uid // 🔑 vincula pagamento ao usuário logado
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    console.log("Preferência criada:", result.id);
    res.json({ id: result.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
  }
});

// ----------------- WEBHOOK -----------------
app.post("/webhook-mercadopago", async (req, res) => {
  console.log("🔔 Webhook recebido:", req.body);

  try {
    if (req.body.type === "payment") {
      const paymentId = req.body.data.id;
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });

      if (paymentDetails.status === "approved") {
        const uid = paymentDetails.external_reference; // 🔑 pega o UID enviado na criação
        const planName = paymentDetails.additional_info.items[0].title;

        if (uid) {
          await db.collection("usuarios").doc(uid).set({
            plano: planName,
            status: "ativo",
            paymentId: paymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          console.log(`✅ Acesso liberado para UID ${uid} no plano ${planName}`);
        } else {
          console.warn("⚠ Pagamento aprovado mas sem UID associado");
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).send("Erro no servidor ao processar webhook");
  }
});

// ----------------- EXPORTA API -----------------
exports.api = functions.https.onRequest(app);
