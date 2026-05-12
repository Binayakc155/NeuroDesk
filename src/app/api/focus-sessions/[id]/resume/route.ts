import { requireAuth } from "@/lib/clerk-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
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
        { error: "Unauthorized to update this session" },
        { status: 403 }
      );
    }

    if (focusSession.endTime) {
      return NextResponse.json(
        { error: "Cannot resume a completed session" },
        { status: 400 }
      );
    }

    if (focusSession.status === "active" || !focusSession.pausedAt) {
      return NextResponse.json(
        { error: "Session is already active" },
        { status: 409 }
      );
    }

    const pausedAt = focusSession.pausedAt;
    const pausedSeconds = Math.max(
      0,
      Math.floor((Date.now() - pausedAt.getTime()) / 1000)
    );

    const resumeResult = await prisma.focusSession.updateMany({
      where: {
        id,
        userId: user.id,
        status: "paused",
        endTime: null,
        pausedAt,
      },
      data: {
        status: "active",
        pausedAt: null,
        pausedDuration: focusSession.pausedDuration + pausedSeconds,
      },
    });

    if (resumeResult.count === 0) {
      const currentSession = await prisma.focusSession.findUnique({
        where: { id },
        include: {
          distractions: true,
        },
      });

      if (!currentSession) {
        return NextResponse.json(
          { error: "Focus session not found" },
          { status: 404 }
        );
      }

      if (currentSession.endTime) {
        return NextResponse.json(
          { error: "Cannot resume a completed session" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Session cannot be resumed from current state: ${currentSession.status}. Session must be in paused state to resume.`,
        },
        { status: 409 }
      );
    }

    const updatedSession = await prisma.focusSession.findUnique({
      where: { id },
      include: {
        distractions: true,
      },
    });

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Focus session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error resuming focus session:", error);
    return NextResponse.json(
      { error: "Failed to resume focus session" },
      { status: 500 }
    );
  }
}
