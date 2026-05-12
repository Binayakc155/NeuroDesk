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
      return NextResponse.json(focusSession);
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
