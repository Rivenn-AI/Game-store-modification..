import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploder";

/** ==============================
 *  MEMBER / CLIENT AUTH ROUTES
 *  ============================== */

router.get("/member/store", memberController.getStore);

router.post(
  "/member/signup",
  makeUploader("members").single("memberImage"),
  memberController.signup,
);

router.post("/member/login", memberController.login);

router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout,
);

router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail,
);

router.post(
  "/member/update",
  memberController.verifyAuth,
  makeUploader("members").single("memberImage"),
  memberController.updateMember,
);

router.get("/member/top-users", memberController.getTopUsers);

/** ==============================
 *  PRODUCT CLIENT ROUTES
 *  ============================== */

router.get("/product/all", productController.getProducts);

router.get(
  "/product/:id",
  memberController.retrieveAuth,
  productController.getProduct,
);

export default router;
