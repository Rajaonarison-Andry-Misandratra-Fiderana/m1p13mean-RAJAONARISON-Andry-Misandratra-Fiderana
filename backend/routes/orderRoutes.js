const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getShopOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} = require("../controllers/orderController");
const { auth, authorize } = require("../middleware/auth");

// Protected routes (all authenticated users)
router.post("/", auth, createOrder);
router.get("/my-orders", auth, getMyOrders);
router.get("/:id", auth, getOrderById);

// Shop routes
router.get("/shop/orders", auth, authorize(["boutique"]), getShopOrders);
router.put("/:id/status", auth, updateOrderStatus);
router.put("/:id/payment-status", auth, updatePaymentStatus);

// Admin only routes
router.get("/", auth, authorize(["admin"]), getAllOrders);
router.delete("/:id", auth, authorize(["admin"]), deleteOrder);

module.exports = router;
