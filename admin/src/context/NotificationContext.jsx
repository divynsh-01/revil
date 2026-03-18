import { createContext, useCallback, useContext, useEffect, useState } from "react";

const NotificationContext = createContext({
  show: () => {},
  clear: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const show = useCallback((message, type = "info", duration = 4000) => {
    setNotification({ message, type, duration });
  }, []);

  const clear = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => {
      setNotification(null);
    }, notification.duration ?? 4000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ show, clear }}>
      {children}
      {notification && (
        <div className="fixed top-20 left-1/2 z-50 w-[90%] max-w-xl -translate-x-1/2">
          <div
            className={`w-full rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-opacity duration-200 ${
              notification.type === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : notification.type === "success"
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-blue-300 bg-blue-50 text-blue-800"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm leading-relaxed">{notification.message}</div>
              <button
                onClick={clear}
                className="text-lg font-bold leading-none text-current opacity-70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
