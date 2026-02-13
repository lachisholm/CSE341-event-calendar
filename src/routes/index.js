const express = require("express");
const router = express.Router();

const eventsRoutes = require("./events");
const attendeesRoutes = require("./attendees");

router.use("/events", eventsRoutes);
router.use("/attendees", attendeesRoutes);

module.exports = router;
