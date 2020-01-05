const { Router } = require("express");
const { GameController } = require("../controllers");

const router = Router();

router.get("/", GameController.index);

router.get("/create", GameController.create);

router.get("/all-games", GameController.getAllGames);

router.get("/start-game", GameController.startGame);

router.get("/:id", GameController.getFullGameData);

router.post("/:id/select-card", GameController.selectCard);

router.get("/:id/take-prise", GameController.takePrise);

module.exports = router;
