require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cors = require("cors");

/**
 * Route list
 */
const gameRoutes = require("./routes/game.router");

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/card-games";
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs"
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

// add socketio object to every request object
app.set("socketio", io);

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/game", gameRoutes);

app.get("/", (req, res) => {
  res.send("Hello boi\n");
});

app.get("*", (req, res) => {
  res.status(404).send("Not found");
});

async function start() {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    server.listen(PORT, () => {
      console.log(`Server has been started on ${PORT} port`);

      io.on('connection', socket => {
        app.set("socket", socket);
      });
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

start();
