const { Schema, model } = require("mongoose");

const gameSchema = new Schema({
  isCompleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "inProgress"
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  cards: [{
    type: Schema.Types.ObjectId,
    ref: "Card"
  }],
  selectedCards: [{
    type: Schema.Types.ObjectId,
    ref: "Card"
  }]
});

module.exports = model("Game", gameSchema);
