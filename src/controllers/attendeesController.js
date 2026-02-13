const mongoose = require("mongoose");
const Attendee = require("../models/Attendee");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAllAttendees = async (req, res, next) => {
  try {
    const attendees = await Attendee.find().sort({ createdAt: -1 });
    res.status(200).json(attendees);
  } catch (err) {
    next(err);
  }
};

exports.createAttendee = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Valid eventId is required"
      });
    }

    const attendee = await Attendee.create(req.body);
    res.status(201).json(attendee);
  } catch (err) {
    next(err);
  }
};
