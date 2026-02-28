import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerScope } from "@/lib/scope-server";

const CLEAR_ARCHIVE_BATCH_SIZE = 100;
const CLEAR_ARCHIVE_CHECKPOINT_INTERVAL = 1;

function checkpointWal(db: ReturnType<typeof getDb>, mode: "PASSIVE" | "TRUNCATE" = "PASSIVE") {
  try {
    db.pragma(`wal_checkpoint(${mode})`);
  } catch (error) {
    console.warn(`[archive/clear] WAL checkpoint (${mode}) failed:`, error);
  }
}

function isDiskFullError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lowered = message.toLowerCase();
  return lowered.includes("database or disk is full") || lowered.includes("sqlite_full");
}

function runBatchedArchiveClear(
  db: ReturnType<typeof getDb>,
  ownerColumn: "user_id" | "guest_id",
  ownerValue: string
): number {
  const deleteBatchStmt = db.prepare(
    `DELETE FROM archive_messages
     WHERE id IN (
       SELECT id FROM archive_messages
       WHERE ${ownerColumn} = ?
       LIMIT ?
     )`
  );

  let deleted = 0;
  let batchCount = 0;

  while (true) {
    const result = deleteBatchStmt.run(ownerValue, CLEAR_ARCHIVE_BATCH_SIZE);
    const changes = Number(result?.changes ?? 0);
    if (changes <= 0) break;

    deleted += changes;
    batchCount += 1;

    if (batchCount % CLEAR_ARCHIVE_CHECKPOINT_INTERVAL === 0) {
      checkpointWal(db, "PASSIVE");
    }

    if (batchCount > 250000) {
      throw new Error("Batched archive clear exceeded safety limit.");
    }
  }

  checkpointWal(db, "TRUNCATE");
  return deleted;
}

/**
 * Clear all archive messages from the database for the current user/guest
 * POST /api/archive/clear
 */
export async function POST(request: NextRequest) {
  try {
    // Get scope for authentication
    const scope = await getServerScope(request);
    
    if (!scope) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const db = getDb();
    const ownerColumn: "user_id" | "guest_id" = scope.kind === "user" ? "user_id" : "guest_id";
    const ownerValue = scope.kind === "user" ? scope.userId : scope.guestId;

    // Reclaim any existing WAL bytes before attempting large deletes.
    checkpointWal(db, "TRUNCATE");

    // Safe housekeeping for import-rate events (can free a little space).
    if (scope.kind === "user") {
      try {
        db.prepare(`DELETE FROM archive_import_events WHERE user_id = ?`).run(scope.userId);
      } catch (error) {
        console.warn("[archive/clear] failed to prune import events:", error);
      }
    }

    // Fast path: one-shot delete.
    try {
      const result = db
        .prepare(`DELETE FROM archive_messages WHERE ${ownerColumn} = ?`)
        .run(ownerValue);

      checkpointWal(db, "TRUNCATE");

      return NextResponse.json({
        success: true,
        deleted: Number(result.changes ?? 0),
        message: `Cleared ${result.changes} messages from archive`,
        mode: "single",
      });
    } catch (singleDeleteError) {
      console.warn("[archive/clear] single-delete path failed, falling back to batched clear:", singleDeleteError);
      checkpointWal(db, "TRUNCATE");

      // Fallback path for low-disk/WAL pressure scenarios.
      try {
        const deleted = runBatchedArchiveClear(db, ownerColumn, ownerValue);
        return NextResponse.json({
          success: true,
          deleted,
          message: `Cleared ${deleted} messages from archive`,
          mode: "batched",
        });
      } catch (batchedError) {
        const singleMessage =
          singleDeleteError instanceof Error ? singleDeleteError.message : "single delete failed";
        const batchMessage =
          batchedError instanceof Error ? batchedError.message : "batched delete failed";
        throw new Error(
          `Failed to clear archive. Single delete error: ${singleMessage}. Batched fallback error: ${batchMessage}.`
        );
      }
    }
  } catch (error) {
    console.error("Error clearing archive:", error);
    if (isDiskFullError(error)) {
      return NextResponse.json(
        {
          error:
            "database or disk is full. Increase Railway disk space, then retry Clear Archive.",
        },
        { status: 507 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear archive" },
      { status: 500 }
    );
  }
}
