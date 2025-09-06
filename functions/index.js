const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

// Configuração de CORS
app.use(cors({ origin: true }));
app.use(express.json());

// Configure Mercado Pago com sua credencial de TESTE
mercadopago.configurations.setAccessToken(
  "APP_USR-1084694532738590-090520-3ea72ac2bbf4b4e462a1bd1670b7874b-2669325151"
);

// Rota para criar uma preferência de pagamento
app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "Plano Básico - Jiu-Jitsu Puro",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 9.9,
        },
      ],
      back_urls: {
        success: "https://jiu-jitsu-puro.web.app/success.html",
        failure: "https://jiu-jitsu-puro.web.app/failure.html",
        pending: "https://jiu-jitsu-puro.web.app/pending.html",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    res.set("Access-Control-Allow-Origin", "*"); // garante CORS
    res.json({ id: response.body.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Exporta como função Firebase
exports.api = functions.https.onRequest(app);
