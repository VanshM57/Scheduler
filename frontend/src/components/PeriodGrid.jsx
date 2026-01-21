import { motion } from "framer-motion";
import { Edit, XCircle, Clock, User, Building2, GraduationCap, Users } from "lucide-react";
import Card from "./ui/Card";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

export default function PeriodGrid({ schedule, handleEdit, handleCancel, canEdit, canCancel, dateType }) {
  const { user } = useContext(UserDataContext);
  
  if(schedule.length === 0) {
    return (
      <div className="text-center py-12 bg-[#111] rounded-2xl border border-gray-700">
        <p className="text-gray-400">No periods scheduled</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {schedule.map((period) => (
        <motion.div
          key={period._id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: period.isClassCancelled ? 0.6 : 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Card className={`h-full flex flex-col transition-all duration-300 ${
            period.isClassCancelled 
              ? 'bg-red-900/10 border-red-500/50' 
              : 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/50 hover:border-blue-500'
          }`}>
            <div className={`flex justify-between items-start mb-3 pb-3 border-b flex-shrink-0 ${
              period.isClassCancelled ? 'border-red-500/30' : 'border-gray-700'
            }`}>
              <h3 className="text-lg font-bold text-white capitalize flex-1 line-clamp-2">
                {period.periodName}
              </h3>
              {(canEdit || canCancel) && (
                <div className="flex gap-2 ml-2 flex-shrink-0">
                  {canEdit && (
                    <Edit 
                      className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors" 
                      size={18}
                      onClick={() => handleEdit(period)}
                      title={dateType === 'today' ? 'Edit today period' : dateType === 'future' ? 'Edit master schedule (admin)' : 'Cannot edit past periods'}
                    />
                  )}
                  {canCancel && (
                    <XCircle 
                      className="cursor-pointer text-red-400 hover:text-red-300 transition-colors" 
                      size={18}
                      onClick={() => handleCancel(period._id)}
                      title="Cancel today period"
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{period.startTime} - {period.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="capitalize truncate">{period.teacherName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Building2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="uppercase truncate">Room: {period.roomNo}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <GraduationCap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="uppercase truncate">{period.branch} - Sem {period.sem}</span>
              </div>
              
              {period.batch && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span className="capitalize truncate">Batch: {period.batch}</span>
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-3 space-y-2 flex-shrink-0">
              {period.updatedBy && (
                <div className="border-t border-gray-700 pt-2">
                  <p className="text-xs text-gray-400 italic line-clamp-2">
                    {period.updatedBy}
                  </p>
                </div>
              )}
              
              {period.isClassCancelled && (
                <div className={`${period.updatedBy ? '' : 'border-t border-red-500/30 pt-2'}`}>
                  <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                    CANCELLED
                  </span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}