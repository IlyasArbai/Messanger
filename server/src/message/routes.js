import express from "express";
import { MessageController } from "./controller.js";
import { authenticate, validate } from "../utils/middlewares.js";
import { createMessageSchema, updateMessageSchema } from "./validator.js";
import { idParamSchema } from "../utils/validator.js";

const router = express.Router();
router.use(authenticate);

router.post("/", validate(createMessageSchema), MessageController.store);
router.patch(
  "/:id",
  validate(idParamSchema),
  validate(updateMessageSchema),
  MessageController.edit,
);
router.delete("/:id", validate(idParamSchema), MessageController.destroy);

export default router;
