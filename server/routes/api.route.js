import express from "express";
const router = express.Router();

import codeController from "../controllers/code.controller.js";
import shapeController from "../controllers/shape.controller.js";
import scoreController from "../controllers/score.controller.js";
import audienceController from "../controllers/audience.controller.js";

// Check session route
router.get("/session", (req, res) => {
  if (req.session.user) res.send({ user: req.session.user });
  else res.status(401).send({ message: "Unauthorized" });
});

// Code execution routes
router.post("/code/execute", codeController.executeCode);

// Shape routes
router.get("/shape/:patternId", shapeController.getShapeById);
router.get("/shapes", shapeController.getAllShapes);

// Score routes
router.post("/score/compare", scoreController.compareShapes);

// Audience routes
router.get("/audience/startTime", audienceController.getGameStartTime);
router.get("/audience/showcase", audienceController.getShowcaseShapes);
router.get("/audience/leaderboard", audienceController.getLeaderboard);
router.get("/audience/:playerId", audienceController.getCurrentShapeByUserId)

export default router;
