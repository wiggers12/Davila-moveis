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
// Habilita o CORS para permitir que seu site acesse a API
app.use(cors({ origin: true }));
// Habilita o Express para interpretar o corpo das requisições como JSON
app.use(express.json());

// ----------------- CONFIGURAÇÃO DO CLIENTE MERCADO PAGO -----------------
const client = new MercadoPagoConfig({
  accessToken: functions.config().mercadopago.token
});

// ----------------- ROTA PARA CRIAR PREFERÊNCIA DE PAGAMENTO -----------------
app.post("/create_preference", async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
          id: req.body.title, // Passamos o nome do plano como ID para referência
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

      if (paymentDetails.status === 'approved') {
        console.log(`✅ Pagamento ${paymentId} APROVADO!`);
        
        const payerEmail = paymentDetails.payer.email;
        const planName = paymentDetails.additional_info.items[0].title;

        try {
          const userRecord = await admin.auth().getUserByEmail(payerEmail);
          const userId = userRecord.uid;
          
          // ATUALIZA O DOCUMENTO DO USUÁRIO NA COLEÇÃO "usuarios"
          const userDocRef = db.collection('usuarios').doc(userId);
          await userDocRef.update({
            plano: planName,
            status: 'ativo', // Define o status como ATIVO
            paymentId: paymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`Acesso liberado para ${payerEmail} (UID: ${userId}) no plano ${planName}`);
        } catch (authError) {
          console.error(`Erro: Usuário com e-mail ${payerEmail} pagou mas não foi encontrado no Firebase Auth.`, authError);
        }
      }
    }
    // Responde 200 OK para o Mercado Pago para confirmar o recebimento
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    res.status(500).send("Erro no servidor ao processar webhook");
  }
});


// ----------------- EXPORTA A API PARA O FIREBASE -----------------
exports.api = functions.https.onRequest(app);