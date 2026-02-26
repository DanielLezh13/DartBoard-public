# Patch for useChatSessions.ts - Replace localStorage with DB

## Instructions:
1. Open hooks/useChatSessions.ts
2. Apply the following changes:

### Change 1: Replace localStorage section (around line 192)
Find this section:
```typescript
// ─── Folder persistence (localStorage) ───
const FOLDER_PERSIST_KEY = "chat:folderPersistV1";

const loadFolderPersist = (): FolderPersistV1 | null => {
  // ... entire function
};

const saveFolderPersist = useCallback((foldersData: SidebarFolder[], sessionsData: SidebarSession[]) => {
  // ... entire function
}, []);
```

Replace with:
```typescript
// ─── Folder persistence (DB-backed) ───
// Note: localStorage folder persistence removed - now using DB
```

### Change 2: Remove FolderPersistV1 type (around line 29)
Delete this entire type definition:
```typescript
type FolderPersistV1 = {
  version: 1;
  folders: { id: number; name: string }[];
  sessionFolderMap: Record<number, number | null>;
  folderSessionOrder: Record<number, number[]>;
};
```

### Change 3: Update loadSessions function (around line 345)
Find:
```typescript
setSessions(sortedSessions);

// Load persisted folder data from localStorage
const persisted = loadFolderPersist();
if (persisted) {
  // ... all the localStorage logic
}
```

Replace with:
```typescript
setSessions(sortedSessions);

// Folders are now loaded from DB via /api/sessions response
// No localStorage folder persistence needed
```

### Change 4: Add folder loading after loadSessions (around line 435)
Find:
```typescript
} finally {
  setHasLoadedSessions(true);
}
```

Replace with:
```typescript
} finally {
  setHasLoadedSessions(true);
  // Load folders from DB after sessions are loaded
  loadFoldersFromDB();
}
```

### Change 5: Add loadFoldersFromDB function (add after the folder persistence section)
```typescript
// Load folders from DB
const loadFoldersFromDB = useCallback(async () => {
  try {
    const response = await fetch("/api/folders");
    if (!response.ok) return;
    const folders = await response.json();
    
    const sidebarFolders: SidebarFolder[] = folders.map((f: any) => ({
      id: f.id,
      name: f.name,
    }));
    
    setFolders(sidebarFolders);
  } catch (err) {
    console.error("Error loading folders from DB:", err);
  }
}, []);
```

### Change 6: Update dependency array (around line 439)
Find:
```typescript
}, [sortSessionsByMRU]);
```

Replace with:
```typescript
}, [sortSessionsByMRU, loadFoldersFromDB]);
```

### Change 7: Remove exports (around line 910)
Find and remove these lines:
```typescript
// Persistence
loadFolderPersist,
saveFolderPersist,
```

## That's it!
The file should now use DB instead of localStorage for folders.
