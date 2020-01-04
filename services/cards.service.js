const _ = require("lodash");

const { CardModel } = require("../models");

/**
 * Add 5 cards to database to new game
 * Return randomly sorted cards
 */
const addNewGameCards = async gameId => {
  try {
    let cards = [];
    for (let i = 1; i <= 5; i++) {
      cards.push(new CardModel({ value: i, gameId: gameId }).save());
    }
    const newCards = await Promise.all(cards);
    const sortedCards = _.shuffle(newCards).map(i => i._id);
    // const sortedCards = newCards.map(i => i._id);
    return sortedCards;
  } catch (err) {
    throw err;
  }
};

/**
 * Check if request cards gameId is equal to gameId
 */
const checkCardsInTheGameObject = async (
  selectedCards,
  gameCards,
  requestCardsLength
) => {
  let areCardsInTheGame = true;

  // check if game object have request cards ids
  for (let i = 0; i < selectedCards.length; i++) {
    const cardId = selectedCards[i]._id;
    if (
      selectedCards[i] &&
      selectedCards[i]._id &&
      !gameCards.find(i => i.equals(cardId))
    ) {
      areCardsInTheGame = false;
      break;
    }
  }

  if (
    selectedCards.length !== requestCardsLength ||
    selectedCards.some(i => !i) ||
    !areCardsInTheGame
  ) {
    throw new Error("Selected cards are not valid");
  }
};

/**
 * Check for req cards value order
 */
const checkCorrectCardsPosition = (selectedCards, gameCards) => {
  let correctCardsPosition = true;
  // check correct position of cards
  for (let i = 1; i <= selectedCards.length; i++) {
    if (
      selectedCards[i - 1].value !== i ||
      !gameCards.find(c => c.toString() === selectedCards[i - 1]._id.toString())
    ) {
      correctCardsPosition = false;
      break;
    }
  }

  return correctCardsPosition;
};

module.exports = {
  addNewGameCards,
  checkCardsInTheGameObject,
  checkCorrectCardsPosition
};
