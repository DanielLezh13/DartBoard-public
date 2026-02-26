# Complete Folder Migration Guide

## What's Been Done ✅
1. Database tables created (`chat_folders`, `session_folder_mapping`)
2. API endpoints created (`/api/folders`, `/api/session-folder`)
3. Frontend updated to use DB instead of localStorage
4. `/api/sessions` now includes `inFolderId` for each session

## Migration Steps (Chrome as Master)

### Step 1: Run Migration Script
1. Open Chrome browser
2. Open the chat app
3. Open DevTools (F12)
4. Copy the entire contents of `migrate-folders-console.js`
5. Paste in console and press Enter
6. Run `migrateFoldersToDB()` to start migration

### Step 2: Verify Migration
After migration completes:
1. Refresh the page in Chrome
2. Folders should still be visible (now from DB)
3. Check console for success message

### Step 3: Test Cross-Browser Sync
1. Open Safari/Firefox
2. Navigate to the chat app
3. The folders should now appear!
4. Create a new folder in Safari
5. Refresh Chrome - the new folder should appear

## Troubleshooting

### If folders disappear after migration:
- Check the backup key in console
- Restore from localStorage backup: 
  ```js
  const backupKey = "chat:folderPersistV1_backup_XXXXX";
  const backup = localStorage.getItem(backupKey);
  localStorage.setItem("chat:folderPersistV1", backup);
  ```

### If errors occur:
1. Check browser console for error messages
2. Verify `/api/folders` returns data
3. Check Network tab for failed API calls

## Technical Details

- **Before**: Folders stored in localStorage (browser-specific)
- **After**: Folders stored in SQLite database (cross-browser)
- **Migration**: One-time copy from localStorage to DB
- **Backup**: Automatically created in localStorage

The folder system now works exactly like the memory system - everything is stored in the database and syncs across all browsers.
