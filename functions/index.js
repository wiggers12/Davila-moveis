// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

// ✅ Configuração de CORS (Forma Correta e Segura)
// Substitua o app.use(cors()) por esta configuração.
// Isso permite requisições SOMENTE do seu site.
app.use(cors({ origin: "https://jiu-jitsu-puro.web.app" }));

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());

// 🔑 Configuração Mercado Pago
mercadopago.configure({
  // IMPORTANTE: Mova este token para uma variável de ambiente para segurança!
  access_token: "APP_USR-a0b3c8cf-f893-4882-91f4-24767363695c"
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
    
    // O cabeçalho de CORS já foi adicionado pelo middleware, não precisa mais aqui.
    res.json({ id: response.body.id });

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Exporta a API como uma Cloud Function
exports.api = functions.https.onRequest(app);