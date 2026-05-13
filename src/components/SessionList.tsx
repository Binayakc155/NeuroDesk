import React from 'react';

interface Session {
  id: string;
  title: string;
  status: string;
}

interface SessionListProps {
  sessions: Session[];
  refreshSessions?: () => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, refreshSessions }) => {
  const handleStartSession = async (sessionId: string) => {
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (res.ok) {
      if (refreshSessions) refreshSessions();
      alert('Session started!');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to start session');
    }
  };

  return (
    <ul>
      {sessions.map((session) => (
        <li key={session.id}>
          {session.title} - {session.status}
          <button onClick={() => handleStartSession(session.id)}>
            Start Session
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SessionList;
