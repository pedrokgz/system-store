const functions = require("firebase-functions");
const mercadopago = require("mercadopago");

// ATENÇÃO: Cole seu Access Token (chave secreta) do Mercado Pago aqui
const MERCADOPAGO_TOKEN = "APP_USR-8792461160034749-072618-0f9a52a9e28b722030ec872ad9757f54-2586270948";

mercadopago.configure({
    access_token: MERCADOPAGO_TOKEN,
});

exports.createPaymentPreference = functions
    .region("southamerica-east1") // Região de São Paulo
    .https.onCall(async (data, context) => {
        // Verifica se o usuário está logado
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "Você precisa estar logado para criar um pagamento."
            );
        }

        const { title, price } = data;
        if (!title || !price) {
             throw new functions.https.HttpsError(
                "invalid-argument",
                "Título e preço são obrigatórios."
            );
        }

        const preference = {
            items: [
                {
                    title: title,
                    unit_price: parseFloat(price),
                    quantity: 1,
                },
            ],
            payer: {
                email: context.auth.token.email,
            },
            back_urls: {
                // Você pode trocar "https://google.com" pela URL do seu site
                success: "https://google.com", 
                failure: "https://google.com",
            },
            auto_return: "approved",
        };

        try {
            const response = await mercadopago.preferences.create(preference);
            return { preferenceId: response.body.id };
        } catch (error) {
            console.error("Erro ao criar preferência no Mercado Pago:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Não foi possível criar a preferência de pagamento."
            );
        }
    });
