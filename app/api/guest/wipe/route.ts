import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerScope } from "@/lib/scope-server";
import { wipeGuestDataByGuestId } from "@/lib/guest-data";

export async function POST(request: NextRequest) {
  console.log("[GUEST_WIPE] start");
  
  try {
    let scope;
    try {
      scope = await getServerScope(request);
    } catch {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (scope.kind !== "guest") {
      return NextResponse.json(
        { error: "Cannot wipe guest data while signed in" },
        { status: 400 }
      );
    }

    const db = getDb();

    const results = wipeGuestDataByGuestId(db, scope.guestId);
    const wipedCount = Object.values(results).reduce((sum, value) => sum + value, 0);

    console.log(`Guest wipe completed for guest ${scope.guestId}:`, results);
    console.log("[GUEST_WIPE] ok");
    
    return NextResponse.json({
      message: wipedCount > 0 ? "Guest data wiped successfully" : "No guest data found to wipe",
      wiped: wipedCount > 0,
      results,
    });
    
  } catch (error) {
    console.error("Error wiping guest data:", error);
    return NextResponse.json(
      { error: "Failed to wipe guest data" },
      { status: 500 }
    );
  }
}
