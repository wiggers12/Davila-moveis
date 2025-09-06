const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Criar cliente Mercado Pago com o accessToken
const client = new mercadopago.MercadoPagoConfig({
  accessToken: "APP_USR-1084694532738590-090520-3ea72ac2bbf4b4e462a1bd1670b7874b-2669325151",
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

    // Criar preferência via nova API
    const response = await new mercadopago.Preference(client).create({ body: preference });

    res.set("Access-Control-Allow-Origin", "*");
    res.json({ id: response.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Exporta como função Firebase
exports.api = functions.https.onRequest(app);
