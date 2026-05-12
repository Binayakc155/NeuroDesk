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
        { error: "Cannot pause a completed session" },
        { status: 400 }
      );
    }

    if (focusSession.status === "paused" && focusSession.pausedAt) {
      return NextResponse.json(focusSession);
    }

    const updatedSession = await prisma.focusSession.update({
      where: { id },
      data: {
        status: "paused",
        pausedAt: new Date(),
      },
      include: {
        distractions: true,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error pausing focus session:", error);
    return NextResponse.json(
      { error: "Failed to pause focus session" },
      { status: 500 }
    );
  }
}
