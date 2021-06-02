const router = require("express").Router();
const swipeRoutes = require("./swipe-routes");
const userRoutes = require("./user-routes");
const matchTransactionRoutes = require("./matchTransaction-routes");
const oldMatchRoutes = require("./oldMatch-routes");

router.use("/users", userRoutes);
router.use("/swipes", swipeRoutes);
router.use("/matchtransactions", matchTransactionRoutes);
router.use("/oldmatches", oldMatchRoutes);

module.exports = router;