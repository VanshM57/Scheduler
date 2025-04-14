import React from "react";
import Button from "./ui/Button";

export default function AddModal({ addForm, setAddForm, handleSubmit, handleCancel }) {
  const handleChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#111] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-4">
        <h2 className="text-xl font-bold text-white mb-3 text-center">Add New Period</h2>

        <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-1">Period Name</label>
            <input
              type="text"
              name="periodName"
              value={addForm.periodName}
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Teacher Name</label>
            <input
              type="text"
              name="teacherName"
              value={addForm.teacherName}
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={addForm.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={addForm.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Room No</label>
            <input
              type="text"
              name="roomNo"
              value={addForm.roomNo}
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-1">Branch</label>
              <input
                type="text"
                name="branch"
                value={addForm.branch}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Batch</label>
              <input
                type="text"
                name="batch"
                value={addForm.batch}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Semester</label>
            <input
              type="number"
              name="sem"
              min={1}
              max={8}
              value={addForm.sem}
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
