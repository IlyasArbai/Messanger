import express from "express";
import { FriendRequestController } from "./controller.js";
import { authenticate, validate } from "../utils/middlewares.js";
import { createRequest, updateRequest } from "./validator.js";
import { idParamSchema } from "../utils/validator.js";

const router = express.Router();

router.get("/", authenticate, FriendRequestController.index);
router.post(
  "/",
  authenticate,
  validate(createRequest),
  FriendRequestController.store,
);
router.patch(
  "/:id",
  authenticate,
  validate(idParamSchema),
  validate(updateRequest),
  FriendRequestController.edit,
);
router.delete("/:id", validate(idParamSchema), FriendRequestController.destroy);

export default router;
