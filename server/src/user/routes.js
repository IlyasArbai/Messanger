import express from "express";
import { UserController } from "./controller.js";
import { authenticate, validate } from "../utils/middlewares.js";
import { searchUsersSchema, checkUsername } from "./validator.js";

const router = express.Router();

router.get(
  "/search",
  authenticate,
  validate(searchUsersSchema),
  UserController.search,
);
router.post("/check-username", validate(checkUsername), UserController.check);

export default router;
