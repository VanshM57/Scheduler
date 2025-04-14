import React from "react";

const Calendar = ({ selected, onChange }) => {
  return (
    <div className="flex items-center justify-center bg-[#0a0a0a] relative">
      <div className="relative mt-2 w-full p-8 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50">
        <div>
          <input
            type="date"
            className="w-full p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            value={selected.toISOString().split("T")[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              const dayOfWeek = newDate.toLocaleDateString("en-US", { weekday: "long" });
              console.log(dayOfWeek); // This will log the day name (e.g., "Monday")
              onChange(newDate);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;