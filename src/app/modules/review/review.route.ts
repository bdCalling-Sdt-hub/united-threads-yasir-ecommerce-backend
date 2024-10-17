import { Router } from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.get("/reviews", ReviewController.getAllReviews);
router.get("/single-review/:id", ReviewController.getReviewById);
router.post(
  "/create-review",
  auth("CUSTOMER"),
  validateRequest(ReviewValidation.reviewSchema),
  ReviewController.createReview,
);

router.patch(
  "/update-review/:id",
  auth("CUSTOMER"),
  validateRequest(ReviewValidation.updateReviewSchema),
  ReviewController.updateReview,
);
router.delete("/delete-review/:id", auth("CUSTOMER"), ReviewController.deleteReview);

export const ReviewRoutes = router;
