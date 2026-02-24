import React, { useEffect, useState } from "react";

const FocusSession: React.FC = () => {
  const [focusScore, setFocusScore] = useState(100);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User left the tab: update focus score
        setFocusScore((prev) => Math.max(prev - 10, 0)); // Example: decrease by 10
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Focus Session</h2>
      <p className="text-lg">Focus Score: {focusScore}</p>
      {/* ...existing session UI... */}
    </div>
  );
};

export default FocusSession;