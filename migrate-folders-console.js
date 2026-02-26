// Migration utility: Move folders from localStorage to DB
// Run this in Chrome DevTools console

async function migrateFoldersToDB() {
  console.log("🔄 Starting folder migration from localStorage to DB...");
  
  // 1. Read from localStorage
  const stored = localStorage.getItem("chat:folderPersistV1");
  if (!stored) {
    console.log("❌ No localStorage folders found");
    return;
  }
  
  const localData = JSON.parse(stored);
  console.log("📦 Found", localData.folders.length, "folders in localStorage");
  console.log("📋 Folders:", localData.folders);
  console.log("🗂️ Session mappings:", localData.sessionFolderMap);
  
  // 2. Create folders in DB
  const folderIdMap = {};
  
  for (const localFolder of localData.folders) {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: localFolder.name }),
      });
      
      if (!response.ok) {
        console.error("❌ Failed to create folder:", localFolder.name);
        continue;
      }
      
      const dbFolder = await response.json();
      folderIdMap[localFolder.id] = dbFolder.id;
      console.log(`✅ Created folder: ${localFolder.name} (local: ${localFolder.id} → db: ${dbFolder.id})`);
    } catch (err) {
      console.error("❌ Error creating folder:", err);
    }
  }
  
  // 3. Map sessions to new folder IDs
  console.log("🔄 Migrating session folder assignments...");
  
  for (const [sessionIdStr, localFolderId] of Object.entries(localData.sessionFolderMap)) {
    if (localFolderId === null) continue;
    
    const sessionId = Number(sessionIdStr);
    const dbFolderId = folderIdMap[localFolderId];
    
    if (!dbFolderId) {
      console.warn(`⚠️ No DB folder found for local folder ${localFolderId}, skipping session ${sessionId}`);
      continue;
    }
    
    try {
      const response = await fetch("/api/session-folder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: sessionId, 
          folder_id: dbFolderId 
        }),
      });
      
      if (response.ok) {
        console.log(`✅ Mapped session ${sessionId} to folder ${localFolderId}→${dbFolderId}`);
      } else {
        console.error(`❌ Failed to map session ${sessionId}`);
      }
    } catch (err) {
      console.error(`❌ Error mapping session ${sessionId}:`, err);
    }
  }
  
  // 4. Backup and clear localStorage
  console.log("💾 Backing up localStorage to backup_...");
  const backupKey = `chat:folderPersistV1_backup_${Date.now()}`;
  localStorage.setItem(backupKey, stored);
  
  console.log("🗑️ Clearing localStorage folders...");
  localStorage.removeItem("chat:folderPersistV1");
  
  console.log("✅ Migration complete!");
  console.log(`📁 Backup saved as: ${backupKey}`);
  console.log("🔄 Please refresh the page to see DB-backed folders");
  
  return {
    foldersMigrated: Object.keys(folderIdMap).length,
    sessionsMigrated: Object.keys(localData.sessionFolderMap).filter(k => localData.sessionFolderMap[k] !== null).length,
    backupKey
  };
}

// Export for easy access
window.migrateFoldersToDB = migrateFoldersToDB;

console.log("💿 Migration utility loaded!");
console.log("Run migrateFoldersToDB() in console to start migration");
