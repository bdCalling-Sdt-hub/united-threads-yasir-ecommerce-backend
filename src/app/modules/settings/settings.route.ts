import { Router } from "express";
import { SettingsControllers } from "./settings.controller";
import auth from "../../middlewares/auth";

const router = Router();
router.get("/get-settings", SettingsControllers.getSettings);
router.post("/create-settings", auth("ADMIN"), SettingsControllers.createSettings);
router.patch("/update-settings", auth("ADMIN"), SettingsControllers.updateSettings);
export const SettingsRoutes = router;
