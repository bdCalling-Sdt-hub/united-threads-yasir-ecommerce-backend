import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AiValidation } from "./ai.validation";
import { AiController } from "./ai.controller";

const router = Router();

router.post(
  "/generate-image",
  auth("CUSTOMER"),
  validateRequest(AiValidation.createImageValidation),
  AiController.createImage,
);


export const AiRoutes = router;