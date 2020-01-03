const { Schema, model } = require("mongoose");

const cardModel = new Schema({
  value: {
    type: Number
  },
  gameId: {
    type: Schema.Types.ObjectId,
    ref: "Game"
  }
})

module.exports = model("Card", cardModel);
