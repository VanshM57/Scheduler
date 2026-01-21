import { useState } from "react";
import Button from "./ui/Button";

export default function EditModal({ editForm, setEditForm, handleSave, handleCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="relative w-full max-w-md p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-white text-center">Edit Period</h2>

        <input
          type="text"
          placeholder="Period Name"
          className="w-full mt-4 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          value={editForm.periodName}
          onChange={(e) => setEditForm({ ...editForm, periodName: e.target.value })}
        />

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="time"
            className="w-full sm:w-1/2 p-2.5 sm:p-3 text-sm sm:text-base rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            value={editForm.startTime}
            onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
          />
          <input
            type="time"
            className="w-full sm:w-1/2 p-2.5 sm:p-3 text-sm sm:text-base rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            value={editForm.endTime}
            onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
          />
        </div>

        <input
          type="text"
          placeholder="Teacher Name"
          className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          value={editForm.teacherName}
          disabled
          onChange={(e) => setEditForm({ ...editForm, teacherName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Room No."
          className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          value={editForm.roomNo}
          onChange={(e) => setEditForm({ ...editForm, roomNo: e.target.value })}
        />
        <input
          type="text"
          placeholder="Batch"
          className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          value={editForm.batch}
          onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
