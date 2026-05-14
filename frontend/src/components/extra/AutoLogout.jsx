import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";

const LOGOUT_TIME_SECONDS = 5 * 60; // 5 minutes
export const AutoLogout=()=>{
    const { user, logOut } = useAuth();
  const [timeLeft, setTimeLeft] = useState(LOGOUT_TIME_SECONDS);
  
  const userRef = useRef(user);
  const logOutRef = useRef(logOut);

  useEffect(() => {
    userRef.current = user;
    logOutRef.current = logOut;
  }, [user, logOut]);

  const resetTimer = () => {
    if (userRef.current) {
      setTimeLeft(LOGOUT_TIME_SECONDS);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Reset timer on mount
    setTimeLeft(LOGOUT_TIME_SECONDS);

    // Setup interval for countdown
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // Trigger logout
          logOutRef.current()
            .then(() => {
              toast.warning('You have been logged out due to inactivity.');
            })
            .catch((error) => console.error('Logout error:', error));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      clearInterval(intervalId);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
    return (
         user && (
        <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700">
            Auto-logout in: <span className="text-blue-600">{formatTime(timeLeft)}</span>
          </span>
        </div>
      )


    )
}