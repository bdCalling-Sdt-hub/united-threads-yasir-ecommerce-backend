import { Router } from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get("/orders", auth("ADMIN"), OrderController.getAllOrders);
router.get("/single-order/:id", auth("ADMIN"), OrderController.getOrderById);
router.post("/create-order", auth("CUSTOMER", "ADMIN"), OrderController.createOrder);
router.patch("/update-order/:id", auth("ADMIN"), OrderController.updateOrder);
router.delete("/delete-order/:id", auth("ADMIN"), OrderController.deleteOrder);

export const OrderRoutes = router;