const { GameService, CardService } = require("../services");
const { ErrorResponse } = require("../helpers");

/**
 * GET "/"
 */
const index = async (req, res) => {
  res.render("index", {
    title: "Main"
  });
};

/**
 * GET "/create"
 */
const create = (req, res) => {
  res.render("create", {
    title: "Create game"
  });
};

/**
 * GET "/game/start-game"
 */
const startGame = async (req, res) => {
  const game = await GameService.addNewGame();
  const cards = await CardService.addNewGameCards(game._id);

  game.cards = cards;
  await Promise.all([
    game.save(),
    game
      .populate([
        {
          path: "cards",
          select: "-value"
        }
      ])
      .execPopulate()
  ]);

  res.send(game);
};

/**
 * GET "/game/:id"
 */
const getFullGameData = async (req, res) => {
  const { id } = req.params;
  try {
    const game = await GameService.getFullGameData(id);

    if (game) return res.json({ game });

    throw new Error("Game not found");
  } catch (err) {
    res.status(404).json({ message: err.message || "Not found" });
  }
};

/**
 * POST "/game/:id/select-card"
 * req = { card }
 */
const selectCard = async (req, res) => {
  try {
    const { cards } = req.body;
    const { id: gameId } = req.params;

    if (!gameId) {
      throw new Error("Wrong game id");
    }

    if (!cards) {
      throw new Error("You must send valid cards");
    }

    const [game, cardsFromDB] = await GameService.getGameAndCards(
      gameId,
      cards
    );

    if (!game) {
      throw new ErrorResponse("Game not found", 404);
    }

    if (!cardsFromDB) {
      throw new ErrorResponse("No cards found", 404);
    }

    if (game.isCompleted) {
      throw new Error("Game is already completed. Start another one.");
    }

    await CardService.checkCardsInTheGameObject(
      cardsFromDB,
      game.cards,
      cards.length
    );

    let cardsObjects = cards.map(
      i => (i = cardsFromDB.find(c => c._id.equals(i)))
    );

    const cardsToSelectCount = game.selectedCards.length + 1;
    if (cardsToSelectCount !== cardsObjects.length) {
      throw new Error(
        `You must select ${cardsToSelectCount} ${
          cardsToSelectCount === 1 ? "card" : "cards"
        }`
      );
    }

    const correctCardsPosition = CardService.checkCorrectCardsPosition(
      cardsObjects,
      game.cards
    );

    game.selectedCards = cards;
    await game.populate(["selectedCards"]).execPopulate();

    if (correctCardsPosition) {
      // Game is completed
      if (cardsObjects.length === game.cards.length) {
        game.isCompleted = true;
        game.status = "win";
        await Promise.all([
          game.populate(["cards"]).execPopulate(),
          game.save()
        ]);
        return res.status(200).json({
          message: "You WIN",
          game
        });
      }
      // Game is not completed. Going to the next round.
      await game.save();

      return res.status(200).json({
        message:
          game.selectedCards.length >= 3
            ? "Do you want to go to the next round or complete the game ?"
            : "Next round",
        game
      });
    } else {
      // Game is lost
      game.isCompleted = true;
      game.status = "lost";
      await Promise.all([game.populate(["cards"]).execPopulate(), game.save()]);
      res.status(200).json({
        message: "You LOOSE",
        game
      });
    }
  } catch (err) {
    console.log(err);
    res.status(err.status || 400).json(err.message || "Bad request");
  }
};

/**
 * POST "/game/:id/complete"
 */
const completeGame = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("No valid game id found");
    }

    const game = await GameService.getGameData(id);

    if (!game) {
      throw new ErrorResponse("Game not found", 404);
    }

    if (game.isCompleted) {
      throw new ErrorResponse("Game is already completed", 412);
    }

    if (game.selectedCards.length >= 3) {
      game.isCompleted = true;
      game.status = "win";
      await game.save();

      return res.json({
        message: "You WIN",
        game
      });
    }

    throw new Error("You must select at least 3 cards to complete the game");
  } catch (err) {
    res.status(err.status || 400).json(err.message || "Bad request");
  }
};

module.exports = {
  index,
  create,
  startGame,
  getFullGameData,
  selectCard,
  completeGame
};
