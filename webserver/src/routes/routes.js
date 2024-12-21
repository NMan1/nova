import express from "express";
import { FirebaseAuthController } from "../auth/controllers/firebase-auth-controller.js";
import { verifyToken } from "../auth/middleware/middleware.js";
import { User } from "../controllers/user.js";
import { CoinApi } from "../controllers/coinApi.js";

export const router = express.Router();
const firebaseAuthController = new FirebaseAuthController();
const userController = new User();
const coinApiController = new CoinApi();

router.post("/api/register", firebaseAuthController.registerUser);
router.post("/api/login", firebaseAuthController.loginUser);
router.post("/api/logout", firebaseAuthController.logoutUser);
router.post("/api/reset-password", firebaseAuthController.resetPassword);
router.get("/api/user", verifyToken, userController.getUser);

router.get(
	"/api/coins/searchSymbols",
	verifyToken,
	coinApiController.searchSymbols
);

router.get(
	"/api/coins/symbolHistory",
	verifyToken,
	coinApiController.symbolHistory
);
