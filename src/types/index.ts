// Types for Focus Intelligence Platform

export interface FocusSessionData {
  id: string;
  userId: string;
  teamId?: string;
  startTime: Date;
  endTime?: Date;
  status: "active" | "paused" | "completed";
  pausedAt?: Date | null;
  pausedDuration: number;
  duration: number;
  isDistracted: boolean;
  distractionCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFocusSessionRequest {
  teamId?: string;
  notes?: string;
}

export interface EndFocusSessionRequest {
  isDistracted: boolean;
  distractionCount: number;
  notes?: string;
}

export interface UserStats {
  totalFocusHours: number;
  totalSessions: number;
  focusScore: number;
  averageSessionDuration: number;
  currentWeekData: {
    focusHours: number;
    sessionCount: number;
    focusScore: number;
  };
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  memberCount: number;
  averageFocusHours: number;
  totalTeamFocusHours: number;
  focusScore: number;
}

export interface WeeklyReportData {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  totalFocusHours: number;
  totalSessions: number;
  focusScore: number;
  averageSessionDuration: number;
  distractionCount: number;
}

export interface TeamInviteData {
  id: string;
  teamId: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: "session_complete" | "team_invite" | "weekly_report" | "achievement";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface WhitelistedDomain {
  id: string;
  userId: string;
  domain: string;
  description?: string;
  createdAt: Date;
}

export interface DistractionData {
  id: string;
  focusSessionId: string;
  timestamp: Date;
  description?: string;
}
