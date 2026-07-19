import { useQuery } from "@tanstack/react-query";
import {
  PiCalendarBlankBold,
  PiClockBold,
  PiUserBold,
  PiCheckCircleFill,
  PiSpinner,
  PiUsersThreeBold,
  PiChartBarBold,
  PiListNumbersBold,
  PiLinkBold
} from "react-icons/pi";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const BookingAnalytics = () => {
  const axiosSecure = useAxiosSecure();

  const { data: analytics = {}, isLoading, isError } = useQuery({
    queryKey: ["admin-booking-analytics"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings/admin/analytics");
      return res.data;
    }
  });

  const availableInstructors = analytics.availableInstructors || [];
  const instructorMetrics = analytics.instructorMetrics || [];
  const meetingLogs = analytics.meetingLogs || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <PiSpinner className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm font-black uppercase text-slate-400 tracking-widest">Generating Analytics Reports...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 bg-red-50/50 border border-red-100 rounded-[2rem] max-w-xl mx-auto space-y-4">
        <h3 className="text-xl font-bold text-red-600">Failed to load analytics</h3>
        <p className="text-sm text-slate-500">Please check your backend server connectivity and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
          Booking & Mock Sessions Analytics
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Comprehensive operational overview of IELTS examiner availability, scheduled classes, and completed sessions.
        </p>
      </div>

      {/* Analytics Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl shrink-0">
            <PiUsersThreeBold />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{availableInstructors.length}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Instructors</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-2xl shrink-0">
            <PiChartBarBold />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">
              {instructorMetrics.reduce((acc, curr) => acc + (curr.sessionCount || 0), 0)}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Completed Sessions</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-2xl shrink-0">
            <PiListNumbersBold />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">
              {meetingLogs.filter(log => log.status === "booked").length}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Booked Meetings</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand: Instructors Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Available Right Now */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              Tutors Available Now
            </h2>
            {availableInstructors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tutors have upcoming available slots defined.</p>
            ) : (
              <div className="space-y-3">
                {availableInstructors.map((tutor) => (
                  <div key={tutor._id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                    {tutor.imageUrl ? (
                      <img src={tutor.imageUrl} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <PiUserBold />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-black text-slate-700">{tutor.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{tutor.specialty || "Expert Trainer"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Count */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">
              Sessions Completed by Instructor
            </h2>
            {instructorMetrics.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No completed sessions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {instructorMetrics.map(({ instructor, sessionCount }) => (
                  <div key={instructor?._id || Math.random()} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {instructor?.name ? instructor.name[0] : "?"}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-700">{instructor?.name || "Deleted Tutor"}</div>
                        <div className="text-[9px] text-slate-400">{instructor?.email}</div>
                      </div>
                    </div>
                    <span className="badge badge-primary text-[10px] font-black">{sessionCount} sessions</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Detailed Meeting Logs */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-6 flex items-center gap-2">
            <PiCalendarBlankBold className="text-primary" />
            Meeting & Session Logs
          </h2>

          {meetingLogs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-sm text-slate-400 font-bold">No active or completed sessions recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <th>Instructor</th>
                    <th>Student</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Meeting Link</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {meetingLogs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td>
                        <div className="font-extrabold text-slate-800">{log.instructor?.name || "Deleted Trainer"}</div>
                        <div className="text-[9px] text-slate-400">{log.instructor?.email}</div>
                      </td>
                      <td>
                        <div className="font-extrabold text-slate-800">{log.bookedBy?.name || "Deleted Student"}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-black">{log.bookedBy?.plan} plan</div>
                      </td>
                      <td>
                        <div className="font-extrabold text-slate-700">
                          {new Date(log.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          {new Date(log.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td>
                        {log.status === "completed" ? (
                          <span className="badge badge-success text-[8px] font-black uppercase text-white tracking-widest px-2 py-1.5 flex items-center gap-1 w-fit">
                            <PiCheckCircleFill className="text-xs" /> Completed
                          </span>
                        ) : (
                          <span className="badge badge-warning text-[8px] font-black uppercase text-white tracking-widest px-2 py-1.5 flex items-center gap-1 w-fit">
                            <PiClockBold className="text-xs" /> Booked
                          </span>
                        )}
                      </td>
                      <td>
                        {log.meetingLink ? (
                          <a
                            href={log.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-xs text-primary"
                            title={log.meetingLink}
                          >
                            <PiLinkBold className="w-4 h-4" /> Link
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingAnalytics;
