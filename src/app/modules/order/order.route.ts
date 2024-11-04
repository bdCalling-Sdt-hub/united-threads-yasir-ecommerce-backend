import { Router } from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get("/orders", auth("ADMIN", "CSR"), OrderController.getAllOrders);
router.get("/my-orders", auth("CUSTOMER"), OrderController.getMyOrders);
router.get("/single-order/:id", auth("ADMIN"), OrderController.getOrderById);
router.get("/my-single-order/:id", auth("CUSTOMER"), OrderController.getMySingleOrder);
router.post("/create-order", auth("CUSTOMER", "ADMIN"), OrderController.createOrder);
router.patch("/update-order/:id", auth("ADMIN"), OrderController.updateOrder);
router.delete("/delete-order/:id", auth("ADMIN"), OrderController.deleteOrder);

export const OrderRoutes = router;
