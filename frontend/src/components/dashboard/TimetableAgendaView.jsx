import React from 'react';
import { days, getTodaySchedule, getFlatSchedule } from '../data/timetable';

/**
 * Mobile-only agenda list rendering of the timetable. Shown when the
 * viewport is <= 768px (see responsive.css: .timetable-agenda-view).
 * Desktop keeps the full grid (WeeklyTimetable.jsx); mobile switches to
 * a stacked per-day list since a 6-column grid doesn't fit small screens
 * at a readable size.
 */
export default function TimetableAgendaView() {
  const flatSchedule = getFlatSchedule();

  return (
    <div className="timetable-agenda-view">
      {days.map((day) => {
        const daySlots = flatSchedule
          .filter((e) => e.day === day)
          .sort((a, b) => a.periods[0] - b.periods[0]);

        return (
          <div key={day} className="timetable-agenda-day">
            <p className="timetable-agenda-day-label">{day}</p>

            {daySlots.length === 0 ? (
              <div className="timetable-agenda-slot is-free">
                <span>No scheduled classes</span>
              </div>
            ) : (
              daySlots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`timetable-agenda-slot ${slot.isLab ? 'is-lab' : ''}`}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {slot.isLab
                        ? slot.courses.map((c) => c.name).join(' / ')
                        : slot.courses[0]?.name || slot.code}
                    </div>
                    <div className="timetable-agenda-time">{slot.time}</div>
                  </div>
                  {slot.isLab && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#16a34a',
                      }}
                    >
                      LAB
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
