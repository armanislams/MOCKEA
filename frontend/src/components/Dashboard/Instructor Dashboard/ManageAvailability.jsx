import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiCalendarBlankBold,
  PiClockBold,
  PiLinkBold,
  PiTrashBold,
  PiPlusBold,
  PiUserBold,
  PiNotebookBold,
  PiSpinner,
  PiCheckCircleFill,
  PiWarningBold,
  PiPencilBold
} from "react-icons/pi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ManageAvailability = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch slots
  const { data: result = {}, isLoading } = useQuery({
    queryKey: ["instructor-slots"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings/instructor/slots");
      return res.data;
    },
  });

  const slots = result.slots || [];

  // 2. Create Slot Mutation
  const createSlotMutation = useMutation({
    mutationFn: async (newSlot) => {
      const res = await axiosSecure.post("/bookings/slots", newSlot);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-slots"] });
      toast.success("Availability slot created successfully!");
      // Reset fields
      setStartTime("");
      setEndTime("");
      setMeetingLink("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create slot.");
    },
  });

  // 3. Delete Slot Mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId) => {
      const res = await axiosSecure.delete(`/bookings/slots/${slotId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-slots"] });
      toast.success("Slot removed successfully.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete slot.");
    },
  });

  // 4. Update Slot Mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, meetingLink }) => {
      const res = await axiosSecure.put(`/bookings/slots/${id}`, { meetingLink });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-slots"] });
      toast.success("Meeting link updated successfully.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update meeting link.");
    },
  });

  const handleEditLink = (slotId, currentLink) => {
    Swal.fire({
      title: "Update Meeting Link",
      input: "url",
      inputLabel: "Zoom/Google Meet Link",
      inputValue: currentLink || "",
      inputPlaceholder: "https://zoom.us/j/...",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      customClass: {
        container: "z-[99999]",
        popup: "rounded-[2rem] shadow-2xl border border-slate-100",
        confirmButton: "rounded-xl px-8 py-3 font-bold btn btn-primary text-white border-none mx-2",
        cancelButton: "rounded-xl px-8 py-3 font-bold btn btn-ghost text-slate-500 mx-2 hover:bg-slate-50"
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        updateSlotMutation.mutate({ id: slotId, meetingLink: result.value });
      }
    });
  };

  // 5. Complete Slot Mutation
  const completeSlotMutation = useMutation({
    mutationFn: async (slotId) => {
      const res = await axiosSecure.post(`/bookings/slots/${slotId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-slots"] });
      toast.success("Mock session completed successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to complete mock session.");
    },
  });

  const handleCompleteSlot = (slotId) => {
    Swal.fire({
      title: "Finish Mock Session?",
      text: "This will mark the session as completed and allow you to open new availability slots.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Finish Session",
      cancelButtonText: "No, Keep Booked",
      background: "#ffffff",
      customClass: {
        container: "z-[99999]",
        popup: "rounded-[2rem] shadow-2xl border border-slate-100",
        confirmButton: "rounded-xl px-8 py-3 font-bold btn btn-success text-white border-none mx-2",
        cancelButton: "rounded-xl px-8 py-3 font-bold btn btn-ghost text-slate-500 mx-2 hover:bg-slate-50"
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        completeSlotMutation.mutate(slotId);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Please fill in Date, Start Time, and End Time.");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (startDateTime >= endDateTime) {
      toast.error("End time must be after start time.");
      return;
    }

    createSlotMutation.mutate({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      meetingLink,
    });
  };

  // Identify sessions starting within 24 hours (Senior Dev Reminder Widget)
  const upcomingReminders = slots.filter((slot) => {
    if (slot.status !== "booked") return false;
    const now = new Date();
    const start = new Date(slot.startTime);
    const diffHours = (start - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  });

  return (
    <div className="space-y-10 p-2 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-content text-[10px] font-black uppercase tracking-[0.2em]">
            <PiCalendarBlankBold className="text-primary" /> Schedule & Mentorship
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">Availability</span>
          </h1>
          <p className="text-base text-slate-400 font-medium">
            Setup available dates, hours, and virtual rooms for student IELTS mock speaking sessions.
          </p>
        </div>
      </div>

      {/* 24h Bookings Reminder Widget */}
      {upcomingReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning shadow-lg rounded-[2rem] p-6 border border-warning/20 bg-warning/10 text-slate-800 flex items-start gap-4"
        >
          <PiWarningBold className="text-3xl text-amber-600 shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg">Upcoming Booked Sessions (Next 24 Hours)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingReminders.map((slot) => (
                <div key={slot._id} className="bg-white/80 backdrop-blur-md border border-amber-200/50 p-4 rounded-2xl flex flex-col gap-1.5 text-sm shadow-sm">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <PiUserBold className="text-primary" /> {slot.bookedBy?.name} ({slot.bookedBy?.email})
                  </span>
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <PiClockBold className="text-primary/60" />
                    {new Date(slot.startTime).toLocaleDateString()} &bull;{" "}
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {slot.meetingLink && (
                    <a
                      href={slot.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-primary rounded-lg text-[10px] w-fit font-black uppercase mt-1"
                    >
                      <PiLinkBold /> Launch Virtual Room
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Create Availability Slot */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-fit">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-6 flex items-center gap-2">
            <PiPlusBold className="text-primary" /> Add Slot
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input input-bordered w-full rounded-2xl bg-slate-50 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">Start Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input input-bordered w-full rounded-2xl bg-slate-50 font-bold"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">End Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input input-bordered w-full rounded-2xl bg-slate-50 font-bold"
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-black text-xs uppercase tracking-wider text-slate-500">Virtual Meeting Link</span>
              </label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="input input-bordered w-full rounded-2xl bg-slate-50 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={createSlotMutation.isPending}
              className="btn btn-primary w-full h-14 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-primary/20 mt-4"
            >
              {createSlotMutation.isPending ? (
                <span className="loading loading-spinner" />
              ) : (
                <>
                  <PiPlusBold /> Create Availability
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Slots List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-6">
            Scheduled Availability Slots
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <PiSpinner className="w-10 h-10 text-primary animate-spin" />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-[2rem] space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                <PiCalendarBlankBold />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No slots defined yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Use the left panel to register your speaking mock-interview availability times.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <AnimatePresence>
                {slots.map((slot) => (
                  <motion.div
                    key={slot._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5 border border-slate-100 bg-slate-50/50 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-800 font-extrabold text-base flex items-center gap-2">
                          <PiCalendarBlankBold className="text-primary/70" />
                          {new Date(slot.startTime).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="badge badge-outline border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 py-2.5">
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Status / Student Notes */}
                      {slot.status === "booked" ? (
                        <div className="space-y-1">
                          {(() => {
                            const now = new Date();
                            const start = new Date(slot.startTime);
                            const end = new Date(slot.endTime);
                            const isOngoing = now >= start && now <= end;
                            return isOngoing ? (
                              <span className="badge badge-primary animate-pulse text-[9px] font-black uppercase tracking-widest text-white py-2 px-2.5 flex items-center gap-1.5 w-fit">
                                <PiCheckCircleFill className="text-sm" /> Ongoing Session
                              </span>
                            ) : (
                              <span className="badge badge-success text-[9px] font-black uppercase tracking-widest text-white py-2 px-2.5 flex items-center gap-1.5 w-fit">
                                <PiCheckCircleFill className="text-sm" /> Booked by {slot.bookedBy?.name}
                              </span>
                            );
                          })()}
                          {slot.studentNotes && (
                            <p className="text-xs text-slate-500 font-medium italic flex items-start gap-1">
                              <PiNotebookBold className="text-slate-400 shrink-0 mt-0.5" />
                              <span>"{slot.studentNotes}"</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-ghost text-[9px] font-black uppercase tracking-widest text-slate-400 py-2 px-2.5 w-fit">
                          Available
                        </span>
                      )}

                      <div className="text-xs text-slate-400 flex items-center gap-2 font-semibold">
                        <PiLinkBold className="text-primary/50" />
                        <span className="truncate max-w-[200px]">{slot.meetingLink || "No link added"}</span>
                        <button
                          onClick={() => handleEditLink(slot._id, slot.meetingLink)}
                          className="btn btn-ghost btn-xs btn-circle hover:bg-slate-200 text-slate-500"
                          title="Edit Link"
                        >
                          <PiPencilBold className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      {slot.meetingLink && (
                        <a
                          href={slot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost hover:bg-slate-100 btn-circle text-primary"
                          title="Open Link"
                        >
                          <PiLinkBold className="w-5 h-5" />
                        </a>
                      )}
                      {slot.status === "booked" && (
                        <button
                          onClick={() => handleCompleteSlot(slot._id)}
                          className="btn btn-xs btn-success text-white rounded-lg px-3 py-1.5 font-bold uppercase tracking-wider"
                          title="Finish Session Early"
                        >
                          Finish Early
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (slot.status === "booked") {
                            Swal.fire({
                              title: "Cancel Booking and Delete?",
                              text: "This slot is booked. Deleting it will cancel the student's booking.",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Yes, Cancel & Delete",
                              cancelButtonText: "No",
                              background: "#ffffff",
                              customClass: {
                                container: "z-[99999]",
                                popup: "rounded-[2rem] shadow-2xl border border-slate-100",
                                confirmButton: "rounded-xl px-8 py-3 font-bold btn btn-error text-white border-none mx-2",
                                cancelButton: "rounded-xl px-8 py-3 font-bold btn btn-ghost text-slate-500 mx-2 hover:bg-slate-50"
                              },
                              buttonsStyling: false
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteSlotMutation.mutate(slot._id);
                              }
                            });
                          } else {
                            deleteSlotMutation.mutate(slot._id);
                          }
                        }}
                        disabled={deleteSlotMutation.isPending}
                        className="btn btn-ghost hover:bg-red-50 btn-circle text-red-500"
                        title="Delete Slot"
                      >
                        <PiTrashBold className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAvailability;
