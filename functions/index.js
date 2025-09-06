// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// ✅ 1. Importação atualizada para a nova versão
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

app.use(cors({ origin: "https://jiu-jitsu-puro.web.app" }));
app.use(express.json());

// ✅ 2. Cliente é configurado na inicialização (substitui o .configure)
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-a0b3c8cf-f893-4882-91f4-24767363695c"
});

// Rota para criar preferência de pagamento
app.post("/create_preference", async (req, res) => {
  try {
    // O corpo da preferência agora vai dentro de uma propriedade "body"
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

    // ✅ 3. Cria-se uma nova instância de Preference e chama o método create
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    res.json({ id: result.id });

  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

exports.api = functions.https.onRequest(app);