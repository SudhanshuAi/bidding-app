import React, { useState, useEffect } from 'react';

const Countdown = ({ endTime, serverTimeOffset, onEnd }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            // Calculate current server time
            const now = Date.now() + serverTimeOffset;
            const remaining = Math.max(0, endTime - now);

            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                if (onEnd) onEnd();
            }
        }, 100); // 10hz update for smoothness

        return () => clearInterval(interval);
    }, [endTime, serverTimeOffset]);

    const formatTime = (ms) => {
        if (ms <= 0) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isUrgent = timeLeft < 60000; // Less than 1 minute

    return (
        <div style={{
            fontFamily: 'var,(--font-display)',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: isUrgent ? 'hsl(var(--color-danger))' : 'hsl(var(--color-text))',
            fontVariantNumeric: 'tabular-nums'
        }}>
            {formatTime(timeLeft)}
        </div>
    );
};

export default Countdown;
