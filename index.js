const express = require("express");
const cors = require("cors");
const cardRoutes = require("./routes/cards");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

// Monta as rotas: tudo que estiver em cardRoutes terá o prefixo
app.use("/cards", cardRoutes);
app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Server runing in: http://localhost:3000");
});
