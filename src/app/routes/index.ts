import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { ProductRoute } from "../modules/product/product.route";
import { SettingsRoutes } from "../modules/settings/settings.route";
import { QuoteRoutes } from "../modules/quote/quote.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { OrderRoutes } from "../modules/order/order.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { MetaRoutes } from "../modules/meta/meta.route";
import { QuoteProductRoutes } from "../modules/quote-product/quote-product.route";
import { QuoteCategoryRoutes } from "../modules/quote-category/quote-category.route";
import { ImageRoutes } from "../modules/images/images.route";
import { MessageRouter as MessageRoutes } from "../modules/message/messageRoute";
import { AiRoutes } from "../modules/ai/ai.route";
import { LibraryRoutes } from "../modules/library/library.route";
import { NotificationRoutes } from "../modules/notification/notification.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/product",
    route: ProductRoute,
  },
  {
    path: "/quote-category",
    route: QuoteCategoryRoutes,
  },
  {
    path: "/quote-product",
    route: QuoteProductRoutes,
  },
  {
    path: "/quote",
    route: QuoteRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/settings",
    route: SettingsRoutes,
  },
  {
    path: "/meta",
    route: MetaRoutes,
  },
  {
    path: "/image",
    route: ImageRoutes,
  },
  {
    path: "/message",
    route: MessageRoutes,
  },
  {
    path: "/library",
    route: LibraryRoutes,
  },
  {
    path: "/ai",
    route: AiRoutes,
  },
  {
    path: "/notification",
    route: NotificationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
