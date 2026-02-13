const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    rsvpStatus: { type: String, default: "Going" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendee", attendeeSchema);
