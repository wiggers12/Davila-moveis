// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

// Configuração CORS (permite seu domínio Firebase)
app.use(cors({ origin: ["https://jiu-jitsu-puro.web.app", "http://localhost:5000"] }));
app.use(express.json());

// Criar cliente Mercado Pago
const client = new mercadopago.MercadoPagoConfig({
  accessToken: "APP_USR-1084694532738590-090520-3ea72ac2bbf4b4e462a1bd1670b7874b-2669325151", // teste
});

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

    // Criar preferência
    const pref = new mercadopago.Preference(client);
    const response = await pref.create({ body: preference });

    // Resposta segura com CORS liberado
    res.set("Access-Control-Allow-Origin", "*");
    res.json({ id: response.body.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Exporta a função HTTP do Firebase
exports.api = functions.https.onRequest(app);
