import { useState, useEffect, useCallback } from "react";
import { ChatFolder } from "@/lib/db";

export function useChatFolders() {
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load folders from DB
  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/folders");
      if (!response.ok) throw new Error("Failed to fetch folders");
      const data = await response.json();
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error loading folders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new folder
  const createFolder = useCallback(async (name: string) => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create folder");
      const newFolder = await response.json();
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      console.error("Error creating folder:", err);
      throw err;
    }
  }, []);

  // Update a folder
  const updateFolder = useCallback(async (id: number, name: string) => {
    try {
      const response = await fetch("/api/folders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (!response.ok) throw new Error("Failed to update folder");
      const updatedFolder = await response.json();
      setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f));
      return updatedFolder;
    } catch (err) {
      console.error("Error updating folder:", err);
      throw err;
    }
  }, []);

  // Delete a folder
  const deleteFolder = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete folder");
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Error deleting folder:", err);
      throw err;
    }
  }, []);

  // Set folder for a session
  const setSessionFolder = useCallback(async (sessionId: number, folderId: number | null) => {
    try {
      const response = await fetch("/api/session-folder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, folder_id: folderId }),
      });
      if (!response.ok) throw new Error("Failed to set session folder");
    } catch (err) {
      console.error("Error setting session folder:", err);
      throw err;
    }
  }, []);

  // Get folder for a session
  const getSessionFolder = useCallback(async (sessionId: number): Promise<number | null> => {
    try {
      const response = await fetch(`/api/session-folder?session_id=${sessionId}`);
      if (!response.ok) throw new Error("Failed to get session folder");
      const data = await response.json();
      return data.folderId;
    } catch (err) {
      console.error("Error getting session folder:", err);
      return null;
    }
  }, []);

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    setSessionFolder,
    getSessionFolder,
    reloadFolders: loadFolders,
  };
}
