import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekRange } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all time stats
    const allSessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
    });

    const totalFocusSeconds = allSessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );
    const totalFocusHours = totalFocusSeconds / 3600;
    const totalSessions = allSessions.length;
    const averageSessionDuration =
      totalSessions > 0 ? Math.floor(totalFocusSeconds / totalSessions) : 0;
    const totalDistractions = allSessions.reduce(
      (sum, s) => sum + s.distractionCount,
      0
    );

    // Calculate overall focus score
    const overallFocusScore =
      totalSessions > 0
        ? Math.max(
            0,
            Math.min(100, 100 - (totalDistractions / totalSessions) * 10)
          )
        : 0;

    // Get current week stats
    const { start: weekStart, end: weekEnd } = getWeekRange();

    const weekSessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const weekTotalSeconds = weekSessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );
    const weekTotalHours = weekTotalSeconds / 3600;
    const weekFocusScore =
      weekSessions.length > 0
        ? Math.max(
            0,
            Math.min(
              100,
              100 -
                (weekSessions.reduce((sum, s) => sum + s.distractionCount, 0) /
                  weekSessions.length) *
                  10
            )
          )
        : 0;

    return NextResponse.json({
      totalFocusHours: parseFloat(totalFocusHours.toFixed(2)),
      totalSessions,
      focusScore: overallFocusScore,
      averageSessionDuration,
      currentWeekData: {
        focusHours: parseFloat(weekTotalHours.toFixed(2)),
        sessionCount: weekSessions.length,
        focusScore: weekFocusScore,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
