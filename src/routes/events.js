const express = require("express");
const router = express.Router();

const eventsController = require("../controllers/eventsController");
const ensureAuth = require("../middleware/ensureAuth");

// Public Routes
router.get("/", eventsController.getAllEvents);
router.get("/:id", eventsController.getEventById);

// Protected Routes (Require Login)
router.post("/", ensureAuth, eventsController.createEvent);
router.put("/:id", ensureAuth, eventsController.updateEvent);
router.delete("/:id", ensureAuth, eventsController.deleteEvent);

module.exports = router;