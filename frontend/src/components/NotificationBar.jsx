import { useState, useEffect, useRef } from "react";
import { Bell, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBar = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Count unread notifications (you can add read/unread logic later)
    setUnreadCount(notifications.length);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const importantNotifications = notifications.filter(n => n.isImportant);
  const regularNotifications = notifications.filter(n => !n.isImportant);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 md:w-96 max-w-[calc(100vw-1rem)] sm:max-w-none bg-[#111] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[calc(100vh-5rem)] sm:max-h-[500px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="p-2">
                  {/* Important Notifications First */}
                  {importantNotifications.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-yellow-400 font-semibold px-2 mb-2">IMPORTANT</p>
                      {importantNotifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mb-2 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 hover:bg-yellow-900/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm mb-1">{notification.title}</h4>
                              <p className="text-xs text-gray-300 line-clamp-2">{notification.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Until {new Date(notification.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Regular Notifications */}
                  {regularNotifications.length > 0 && (
                    <div>
                      {importantNotifications.length > 0 && (
                        <p className="text-xs text-gray-500 font-semibold px-2 mb-2">OTHER</p>
                      )}
                      {regularNotifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mb-2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 hover:bg-[#252525] transition-colors cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm mb-1">{notification.title}</h4>
                            <p className="text-xs text-gray-300 line-clamp-2">{notification.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Until {new Date(notification.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700 bg-[#0a0a0a]">
                <p className="text-xs text-gray-400 text-center">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBar;

