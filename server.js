const express = require("express");
const app = express();
const PORT = 3000;
const auth = require("./routes/auth");

app.use(express.json());
// /authのURLでauth（routerメソッド）が使われる
app.use("/auth", auth);

app.get("/", (req, res) => {
  res.send("Hello Express");
});

app.listen(PORT, () => {
  console.log("server running");
});
