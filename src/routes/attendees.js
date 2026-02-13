const express = require("express");
const router = express.Router();

const attendeesController = require("../controllers/attendeesController");

router.get("/", attendeesController.getAllAttendees);
router.post("/", attendeesController.createAttendee);

module.exports = router;
