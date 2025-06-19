import mongoose from "mongoose";

const ticketsModel = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  ticket_price: { type: Number, required: true, unique: true },
  from_location: { type: String, required: true },
  to_location: { type: String, required: true },
  to_location_photo_url: { type: [String], required: true },
});

export default mongoose.model("Ticket", ticketsModel);
