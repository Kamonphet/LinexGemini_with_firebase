/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// Import dependencies
const { onRequest } = require("firebase-functions/v2/https");
const line = require("./utils/line");
const gemini = require("./utils/gemini");

// Create a webhook via HTTP requests
exports.webhook = onRequest(async (req, res) => {
  if (req.method === "POST") {
    const events = req.body.events;
    for (const event of events) {
      switch (event.type) {
        case "message":
          if (event.message.type === "text") {
            const userText = event.message.text;
            const replyText = await gemini.textOnly(userText);
            await line.reply(event.replyToken, [
              { type: "text", text: replyText },
            ]);
          }

          if (event.message.type === "image") {
            const imageBinary = await line.getImageBinary(event.message.id);
            const msg = await gemini.multimodal(imageBinary);
            await line.reply(event.replyToken, [{ type: "text", text: msg }]);
          // }
          // if (event.message.type  === "text") {
          //   const msg = await gemini.chat(event.message.text);
          //   await line.reply(event.replyToken, [{ type: "text", text: msg }]);
            break;
          }
      }
    }
  }
  res.send(req.method);
});

// deploy firebase deploy --only functions
