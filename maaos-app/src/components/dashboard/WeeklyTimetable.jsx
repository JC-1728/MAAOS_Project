import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getWeeklySchedule } from "../../services/calendarService";
import TimetableAgendaView from "./TimetableAgendaView";

export default function WeeklyTimetable() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const loadSchedule = async () => {
      const data = await getWeeklySchedule();
      setSchedule(data);
    };

    loadSchedule();
  }, []);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="w-7 h-7" />
        <h2 className="text-2xl font-bold">
          Weekly Timetable
        </h2>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="timetable-grid-table overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Day</th>
                <th className="border p-3 text-left">Period(s)</th>
                <th className="border p-3 text-left">Time</th>
                <th className="border p-3 text-left">Course</th>
                <th className="border p-3 text-left">Faculty</th>
                <th className="border p-3 text-center">Type</th>
              </tr>
            </thead>

            <tbody>
              {schedule.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="border p-3 font-semibold">
                    {item.day}
                  </td>

                  <td className="border p-3">
                    {item.periods.join(", ")}
                  </td>

                  <td className="border p-3">
                    {item.time}
                  </td>

                  <td className="border p-3">
                    {item.courses
                      .map((course) => course.name)
                      .join(" / ")}
                  </td>

                  <td className="border p-3">
                    {item.courses
                      .flatMap((course) => course.faculty)
                      .join(", ")}
                  </td>

                  <td className="border p-3 text-center">
                    {item.isLab ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        LAB
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        CLASS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {schedule.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Loading timetable...
            </div>
          )}
        </div>

        <TimetableAgendaView />
      </div>
    </div>
  );
}