const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const connectDB = require("./config/db");
connectDB();

//middleware
app.use(cors());
app.use(express.json());

//Route
app.get("/", (req, res) => {
  res.send("serveur fonctionne");
});

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

//Demarage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur fonctionne sur le port ${process.env.PORT || 5000}`);
});
