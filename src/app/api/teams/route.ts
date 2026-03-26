import { requireAuth } from "@/lib/clerk-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // Check if slug already exists
    const existingTeam = await prisma.team.findUnique({
      where: { slug },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "A team with this name already exists" },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description: description || null,
        members: {
          create: {
            userId: user.id,
            role: "admin",
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    const userWithTeams = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!userWithTeams) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const teams = userWithTeams.teamMembers.map((tm) => ({
      ...tm.team,
      userRole: tm.role,
      memberCount: tm.team.members.length,
    }));

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
