import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { ProductRoute } from "../modules/product/product.route";
import { SettingsRoutes } from "../modules/settings/settings.route";
import { QuoteRoutes } from "../modules/quote/quote.route";
import { ReviewRoutes } from "../modules/review/review.route";

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
    path: "/quote",
    route: QuoteRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/settings",
    route: SettingsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
