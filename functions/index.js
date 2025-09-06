// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// Importamos o "Payment" para buscar os detalhes do pagamento
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const app = express();

// Configuração CORS final para garantir o funcionamento
app.use(cors({ origin: true }));

app.use(express.json());

// Use a chave "Access Token" do seu painel do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-1084694532738590-090520-3ea72ac2bbf4b4e462a1bd1670b7874b-2669325151" // Ex: "APP_USR-108469..."
});

app.post("/create_preference", async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
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
    res.json({ id: result.id });

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});


// ✅ NOVA ROTA DE WEBHOOK ADICIONADA AQUI
app.post("/webhook-mercadopago", async (req, res) => {
  console.log("---------- Webhook Recebido ----------");
  console.log(req.body);

  // A notificação vem no corpo da requisição
  const notification = req.body;

  try {
    // Verificamos se a notificação é do tipo 'payment'
    if (notification.type === "payment") {
      const paymentId = notification.data.id;

      // Usamos o SDK para buscar os dados completos do pagamento de forma segura
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });

      console.log("---------- Detalhes do Pagamento ----------");
      console.log(paymentDetails);

      // Verificamos se o pagamento foi aprovado
      if (paymentDetails.status === 'approved') {
        console.log(`✅ Pagamento ${paymentId} APROVADO!`);
        
        // --- LÓGICA DO SEU NEGÓCIO AQUI ---
        // Exemplo:
        // 1. Busque o e-mail do pagador: const email = paymentDetails.payer.email;
        // 2. Procure o usuário no seu banco de dados pelo e-mail.
        // 3. Atualize o status da conta do usuário para "premium".
        // 4. Envie um e-mail de confirmação.
      }
    }

    // Respondemos com status 200 para o Mercado Pago saber que recebemos
    res.sendStatus(200);

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    res.status(500).send("Erro no servidor");
  }
});


exports.api = functions.https.onRequest(app);