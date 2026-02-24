import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teamId, notes } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is member of the team if teamId is provided
    if (teamId) {
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: user.id,
            teamId: teamId,
          },
        },
      });

      if (!teamMember) {
        return NextResponse.json(
          { error: "User is not a member of this team" },
          { status: 403 }
        );
      }
    }

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        teamId: teamId || null,
        startTime: new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json(focusSession, { status: 201 });
  } catch (error) {
    console.error("Error creating focus session:", error);
    return NextResponse.json(
      { error: "Failed to create focus session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const sessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "desc" },
      take: limit,
      skip: offset,
      include: {
        distractions: true,
      },
    });

    const total = await prisma.focusSession.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      sessions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus sessions" },
      { status: 500 }
    );
  }
}
