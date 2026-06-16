import { useState, useEffect, useCallback, useRef } from "react";

export default function useCountdown(initialSeconds, active, submitted, onExpiry) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const onExpiryRef = useRef(onExpiry);

    useEffect(() => {
        onExpiryRef.current = onExpiry;
    }, [onExpiry]);

    useEffect(() => {
        if (!active || submitted) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onExpiryRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [active, submitted]);

    const fmtTime = useCallback((seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }, []);

    const resetCountdown = useCallback((seconds) => {
        setTimeLeft(seconds);
    }, []);

    return { timeLeft, setTimeLeft, fmtTime, resetCountdown };
}
