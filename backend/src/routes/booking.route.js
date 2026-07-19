import express from "express";
import {
  createSlots,
  getInstructorSlots,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  bookSlot,
  getStudentBookings,
  cancelBooking,
  completeBooking,
  getAdminBookingAnalytics
} from "../controllers/booking.controller.js";
import verifyUserToken from "../middlewares/verifyUserToken.js";
import verifyUserRole from "../middlewares/verifyUserRole.js";

const bookingRouter = express.Router();

// Require authenticated token for all endpoints
bookingRouter.use(verifyUserToken);

// Admin Analytics Endpoint
bookingRouter.get("/admin/analytics", verifyUserRole(["admin"]), getAdminBookingAnalytics);

// Student & Public endpoints
bookingRouter.get("/slots/available", getAvailableSlots);
bookingRouter.post("/slots/:id/book", verifyUserRole(["student"]), bookSlot);
bookingRouter.get("/student/bookings", verifyUserRole(["student"]), getStudentBookings);

// Instructor-specific endpoints
bookingRouter.post("/slots", verifyUserRole(["instructor", "admin"]), createSlots);
bookingRouter.get("/instructor/slots", verifyUserRole(["instructor", "admin"]), getInstructorSlots);
bookingRouter.put("/slots/:id", verifyUserRole(["instructor", "admin"]), updateSlot);
bookingRouter.delete("/slots/:id", verifyUserRole(["instructor", "admin"]), deleteSlot);
bookingRouter.post("/slots/:id/complete", verifyUserRole(["instructor", "admin"]), completeBooking);

// Cancellation shared route (either student or instructor)
bookingRouter.post("/slots/:id/cancel", verifyUserRole(["student", "instructor", "admin"]), cancelBooking);

export default bookingRouter;
