// Simple migration script - Run in Chrome console
// Migrates folders from localStorage to DB

async function migrateFolders() {
  console.log("🔄 Starting migration...");
  
  // 1. Get localStorage data
  const stored = localStorage.getItem("chat:folderPersistV1");
  if (!stored) {
    console.log("❌ No localStorage data found");
    return;
  }
  
  const data = JSON.parse(stored);
  console.log("Found", data.folders.length, "folders");
  
  // 2. Create folders in DB
  for (const folder of data.folders) {
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folder.name })
    });
  }
  
  // 3. Update session folder assignments
  for (const [sessionId, folderId] of Object.entries(data.sessionFolderMap)) {
    if (folderId) {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: Number(sessionId), 
          in_folder_id: folderId 
        })
      });
    }
  }
  
  // 4. Clear localStorage
  localStorage.removeItem("chat:folderPersistV1");
  
  console.log("✅ Migration complete! Refresh the page.");
}

// Run it
migrateFolders();
