const router = require("express").Router();
const swipeRoutes = require("./swipe-routes");
const userRoutes = require("./user-routes");

router.use("/users", userRoutes);
router.use("/swipes", swipeRoutes);

module.exports = router;