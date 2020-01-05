const { GameModel, CardModel } = require("../models");
const { ErrorResponse } = require("../helpers");

/**
 * Get all games from database
 */
const getAllGames = async () => {
  try {
    const games = await GameModel.find({})
      .sort({ createdAt: -1 })
      .populate(["selectedCards"]);

    if (games) {
      return games;
    }
    throw new Error("No Games Found");
  } catch (err) {
    throw err;
  }
};

/**
 * Add game to database
 */
const addNewGame = async () => {
  try {
    const game = new GameModel();
    await game.save();
    return game;
  } catch (err) {
    throw err;
  }
};

/**
 * Get full game data with all relations
 */
const getFullGameData = async gameId => {
  try {
    const game = await GameModel.findById(gameId).populate([
      {
        path: "cards",
        select: "-gameId"
      },
      {
        path: "selectedCards",
        select: "-gameId"
      }
    ]);
    return game;
  } catch (err) {
    throw err;
  }
};

/**
 * Get game data with only selectedCards relation
 */
const getGameData = async gameId => {
  try {
    const game = await GameModel.findById(gameId).populate(["selectedCards"]);
    return game;
  } catch (err) {
    throw err;
  }
};

/**
 * Get game data and cards in database
 */
const getGameAndCards = async (gameId, cards) => {
  try {
    const [game, cardsFromDB] = await Promise.all([
      GameModel.findById(gameId),
      CardModel.find({
        _id: {
          $in: cards
        },
        gameId
      })
    ]);
    return [game, cardsFromDB];
  } catch (err) {
    throw err;
  }
};

/**
 * Delete game by id
 */
const deleteGame = async gameId => {
  return new Promise((resolve, reject) => {
    GameModel.findOneAndRemove({ _id: gameId }, (err, deletedGame) => {
      if (err) return reject(err);
      if (!deleteGame) return reject(new ErrorResponse("Game wasn't found", 404));
      if (deletedGame && !err) return resolve(deletedGame);
    });
  });
};

module.exports = {
  getAllGames,
  addNewGame,
  getFullGameData,
  getGameData,
  getGameAndCards,
  deleteGame
};
