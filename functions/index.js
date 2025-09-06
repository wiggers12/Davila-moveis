// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

// Configuração do app
const app = express();
app.use(express.json());

// CORS bem definido (frontend autorizado)
const allowedOrigins = [
  "https://jiu-jitsu-puro.web.app",
  "https://jiu-jitsu-puro.firebaseapp.com",
  "http://localhost:5000"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware para garantir resposta ao preflight
app.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// Cliente Mercado Pago (SDK nova)
const client = new mercadopago.MercadoPagoConfig({
  accessToken: "APP_USR-1084694532738590-090520-3ea72ac2bbf4b4e462a1bd1670b7874b-2669325151", // 🔑 teste
});

// Rota para criar preferência
app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: req.body.title || "Plano Jiu-Jitsu Puro",
          quantity: 1,
          currency_id: "BRL",
          unit_price: req.body.price || 9.9,
        },
      ],
      back_urls: {
        success: "https://jiu-jitsu-puro.web.app/success.html",
        failure: "https://jiu-jitsu-puro.web.app/failure.html",
        pending: "https://jiu-jitsu-puro.web.app/pending.html",
      },
      auto_return: "approved",
    };

    const response = await new mercadopago.Preference(client).create({ body: preference });

    res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.json({ id: response.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Exporta a função
exports.api = functions.https.onRequest(app);
