// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

// Configura CORS global
app.use(cors());
app.use(express.json());

// 🔑 Configuração Mercado Pago
mercadopago.configure({
  access_token: "APP_USR-a0b3c8cf-f893-4882-91f4-24767363695c" // sua Access Token
});

// ✅ Tratamento manual para preflight (Express 5 não aceita '*')
app.options(/.*/, (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});

// Rota para criar preferência de pagamento
app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
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

    const response = await mercadopago.preferences.create(preference);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ id: response.body.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Exporta função para Firebase
exports.api = functions.https.onRequest(app);
