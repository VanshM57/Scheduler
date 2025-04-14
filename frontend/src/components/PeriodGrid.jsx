import { motion } from "framer-motion";
import { Edit, XCircle } from "lucide-react";
import Card from "./ui/Card";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

export default function PeriodGrid({ schedule, handleEdit, handleCancel }) {
  const { user } = useContext(UserDataContext);
  const canEdit = user?.role !== "student";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6
    ">
      {schedule.map((period) => (
        <motion.div
        key={period._id}
        layout
        initial={{ opacity: 0.5 }}
        animate={{ opacity: period.isClassCancelled ? 0.5 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="transition-opacity duration-500">
          <div className={`flex justify-between 
          rounded-xl p-4 border-l-4 ${period.isClassCancelled ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
            <h3 className="text-lg text-white font-bold">{period.periodName.toUpperCase()}</h3>
            {canEdit && (
              <div className="flex gap-2">
              <Edit className="cursor-pointer text-blue-500" onClick={() => handleEdit(period)} />
              <XCircle className="cursor-pointer text-red-500" onClick={() => handleCancel(period._id)} />
              </div>
            )}
          </div>
          <p className="text-white">⏰ {period.startTime}-{period.endTime}</p>
          <p className="text-white">👨‍🏫 {period.teacherName.toUpperCase()}</p>
          <p className="text-white">🏫 Room: {period.roomNo.toUpperCase()}</p>
          <p className="text-white text-base font-semibold">🎓 {period.branch.toUpperCase()} - Semester {period.sem}</p>
          <p className="text-white text-base font-semibold capitalize">Batch- {(period.batch)}</p>
          <p className="text-sm text-white mt-2">Last updated: {period.updatedBy ? period.updatedBy : "Default"}</p>
        </Card>
      </motion.div>
      
      ))}
    </div>
  );
}