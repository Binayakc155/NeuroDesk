import { requireAuth } from "@/lib/clerk-auth";
import { prisma } from "@/lib/prisma";
import { calculateFocusScore } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { isDistracted, distractionCount, notes } = body;

    const focusSession = await prisma.focusSession.findUnique({
      where: { id },
    });

    if (!focusSession) {
      return NextResponse.json(
        { error: "Focus session not found" },
        { status: 404 }
      );
    }

    if (focusSession.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this session" },
        { status: 403 }
      );
    }

    const endTime = new Date();
    const liveDuration = Math.floor(
      (endTime.getTime() - focusSession.startTime.getTime()) / 1000
    );
    const activePauseDuration = focusSession.pausedAt
      ? Math.floor((endTime.getTime() - focusSession.pausedAt.getTime()) / 1000)
      : 0;
    const duration = Math.max(
      0,
      liveDuration - focusSession.pausedDuration - activePauseDuration
    );
    const pausedDuration = focusSession.pausedDuration + activePauseDuration;

    const updatedSession = await prisma.focusSession.update({
      where: { id },
      data: {
        endTime,
        duration,
        status: "completed",
        pausedAt: null,
        pausedDuration,
        isDistracted,
        distractionCount,
        notes: notes || focusSession.notes,
      },
      include: {
        distractions: true,
      },
    });

    // Calculate and create/update weekly report
    const weekStart = new Date(focusSession.startTime);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get all sessions for the week
    const weeklySessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const totalFocusSeconds = weeklySessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );
    const totalFocusHours = totalFocusSeconds / 3600;
    const totalDistractions = weeklySessions.reduce(
      (sum, s) => sum + s.distractionCount,
      0
    );
    const focusScore = calculateFocusScore(totalFocusSeconds, totalDistractions);

    await prisma.weeklyReport.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart,
        },
      },
      create: {
        userId: user.id,
        weekStart,
        weekEnd,
        totalFocusHours,
        totalSessions: weeklySessions.length,
        focusScore,
        averageSessionDuration: Math.floor(totalFocusSeconds / weeklySessions.length),
        distractionCount: totalDistractions,
      },
      update: {
        totalFocusHours,
        totalSessions: weeklySessions.length,
        focusScore,
        averageSessionDuration: Math.floor(totalFocusSeconds / weeklySessions.length),
        distractionCount: totalDistractions,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating focus session:", error);
    return NextResponse.json(
      { error: "Failed to update focus session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const focusSession = await prisma.focusSession.findUnique({
      where: { id },
    });

    if (!focusSession) {
      return NextResponse.json(
        { error: "Focus session not found" },
        { status: 404 }
      );
    }

    if (focusSession.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this session" },
        { status: 403 }
      );
    }

    await prisma.focusSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting focus session:", error);
    return NextResponse.json(
      { error: "Failed to delete focus session" },
      { status: 500 }
    );
  }
}
