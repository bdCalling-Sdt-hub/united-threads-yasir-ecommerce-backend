import { Router } from "express";
import auth from "../../middlewares/auth";
import { MetaController } from "./meta.controller";

const router = Router();

router.get("/users-count", auth("ADMIN"), MetaController.getUsersCount);
router.get("/revenue-count", auth("ADMIN"), MetaController.getMonthlyRevenue);
router.get("/sell-count", auth("ADMIN"), MetaController.getMonthlyProductOrderQuantities);
export const MetaRoutes = router;
