// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Configuração correta do Mercado Pago (use seu token de TESTE aqui)
const mp = new mercadopago.MercadoPagoConfig({
  accessToken: "APP_USR-1084694532738590-090520-3ea72ac2bbf4b4e462a1bd1670b7874b-2669325151", 
  options: { timeout: 5000 }
});

// Criar preferências
const preference = new mercadopago.Preference(mp);

// 🔹 Rota para criar uma preferência de pagamento
app.post("/create_preference", async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: "Plano Básico - Jiu-Jitsu Puro",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 9.90
        }
      ],
      back_urls: {
        success: "https://jiu-jitsu-puro.web.app/success.html",
        failure: "https://jiu-jitsu-puro.web.app/failure.html",
        pending: "https://jiu-jitsu-puro.web.app/pending.html"
      },
      auto_return: "approved"
    };

    const result = await preference.create({ body });
    res.json({ id: result.id }); // devolve o ID da preferência
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// ✅ Exporta como função Firebase
exports.api = functions.https.onRequest(app);
