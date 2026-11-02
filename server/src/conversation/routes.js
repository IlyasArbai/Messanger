import express from "express";
import { ConversationController } from "./controller.js";
import { authenticate, validate } from "#src/utils/middlewares.js";
import { idParamSchema } from "../utils/validator.js";

const router = express.Router();
router.use(authenticate);

router.get("/", ConversationController.index);
router.get("/:id", validate(idParamSchema), ConversationController.show);

export default router;
