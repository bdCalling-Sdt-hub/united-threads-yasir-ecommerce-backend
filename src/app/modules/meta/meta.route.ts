import { Router } from "express";
import auth from "../../middlewares/auth";
import { MetaController } from "./meta.controller";

const router = Router();

router.get("/users-count", auth("ADMIN"), MetaController.getUsersCount);
router.get("/revenue-count", auth("ADMIN"), MetaController.getMonthlyRevenue);
router.get("/sell-count", auth("ADMIN"), MetaController.getMonthlyProductOrderQuantities);
router.get("/user-and-revenue", auth("ADMIN"), MetaController.getUserAndRevenueNumber);
router.get("/earning-growth", auth("ADMIN"), MetaController.getYearlyRevenueWithGrowth);
router.get("/sell-growth", auth("ADMIN"), MetaController.getYearlyProductSellingGrowth);
export const MetaRoutes = router;
