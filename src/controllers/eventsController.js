const mongoose = require("mongoose");
const Event = require("../models/Event");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1, startTime: 1 });
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "InvalidId", message: "Invalid ID format" });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "NotFound", message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "InvalidId", message: "Invalid ID format" });
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: "NotFound", message: "Event not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "InvalidId", message: "Invalid ID format" });
    }

    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "NotFound", message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    next(err);
  }
};
