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

// Game session routes
router.post("/session/start", (req, res) => {
  // Create a new game session
  res.json({
    sessionId: Date.now().toString(),
    message: "New game session started",
  });
});

// Audience routes
router.get("/audience/:playerId", audienceController.getCurrentShapeByUserId)
router.get("/audience/startTime", audienceController.getGameStartTime);
router.get("/audience/showcase", audienceController.getShowcaseShapes);

// Showcase routes
// router.get("/audience/showcase/", showcaseRouter.getShowcaseShapes); // query params: ?userId=1&shapeId=2 return { output: [[1, 2, 3], [4, 5, 6]] }

// Leaderboard routes
// router.get("/audience/leaderboard", leaderboardRouter.getLeaderboard); // return { leaderboard: [{ userId: 1, username: a, score: 100 }, { userId: 2, username: b, score: 90 }] }


export default router;
