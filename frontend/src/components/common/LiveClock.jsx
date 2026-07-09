import { useState, useEffect } from "react";
import { getCurrentTimeInTimezone } from "../../utils/timezones";

/**
 * LiveClock
 *
 * Props:
 *   timezone : IANA string (ex: "Pacific/Auckland")
 */
function LiveClock({ timezone }) {
  const [time, setTime] = useState(() => getCurrentTimeInTimezone(timezone));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getCurrentTimeInTimezone(timezone));
    }, 1000);

    // runs when the component unmounts or timezone changes
    return () => clearInterval(intervalId);
  }, [timezone]);

  return <span className="font-mono tabular-nums">{time}</span>;
}

export default LiveClock;
