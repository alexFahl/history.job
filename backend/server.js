const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Bienvenue sur l'API History.job !" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté avec succès à MongoDB Atlas !");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur back-end démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à MongoDB :", error.message);
  });
