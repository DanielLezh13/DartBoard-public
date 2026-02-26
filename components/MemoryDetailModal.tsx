"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Memory {
  id: number;
  folder_name: string | null;
  title: string | null;
  summary: string;
  created_at: string;
  tags: string | null;
  importance: number | null;
}

interface MemoryDetailModalProps {
  open: boolean;
  memory: Memory | null;
  folders: string[];
  onClose: () => void;
  onSave: (data: {
    id: number;
    title: string;
    folder_name: string;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  saving?: boolean;
  deleting?: boolean;
  error?: string | null;
}

const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  open,
  memory,
  folders,
  onClose,
  onSave,
  onDelete,
  saving = false,
  deleting = false,
  error: externalError = null,
}) => {
  const [title, setTitle] = useState("");
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && memory) {
      setTitle(memory.title || "");
      setFolderName(memory.folder_name || "Unsorted");
      setError(null);
    }
  }, [open, memory]);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSave = async () => {
    if (!memory) return;
    
    try {
      await onSave({
        id: memory.id,
        title: title.trim(),
        folder_name: folderName.trim() || "Unsorted",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!memory) return;
    
    if (!window.confirm("Are you sure you want to delete this memory?")) {
      return;
    }
    
    try {
      await onDelete(memory.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (!open || !memory) {
    return null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="vault-detail-card rounded-2xl border border-slate-800/70 bg-slate-950/95 p-6 shadow-[0_0_40px_rgba(80,120,255,0.35)] max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header with Close */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            {/* Compact Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-gray-700 text-gray-100 px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Title..."
            />
            {/* Compact Folder */}
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-32 bg-gray-700 text-gray-100 px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              placeholder="Folder..."
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 text-xl ml-2"
          >
            ×
          </button>
        </div>

        {/* Giant Scrollable Content Block */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <span className="text-xs text-gray-400">Content</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(memory.summary);
                // Could add a toast notification here
              }}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex-1 overflow-y-auto min-h-0">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mt-4 mb-3 text-gray-100">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mt-3 mb-2 text-gray-100">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mt-3 mb-2 text-gray-100">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="my-2 leading-relaxed text-sm text-gray-200">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside my-2 space-y-1 text-sm text-gray-200">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside my-2 space-y-1 text-sm text-gray-200">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="ml-4 text-gray-200">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4 text-sm text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-gray-200">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto my-4 text-xs text-gray-200">
                        {children}
                      </pre>
                    ),
                    hr: () => <hr className="my-4 border-gray-700" />,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-100">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-200">{children}</em>
                    ),
                  }}
                >
                  {memory.summary}
                </ReactMarkdown>
              </div>
            </div>
          </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm mt-2 flex-shrink-0">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 mt-2 border-t border-gray-700 flex-shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-default text-white px-4 py-2 rounded transition-colors"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-default text-white px-4 py-2 rounded transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
      </div>
    </div>,
    document.body
  );
};

MemoryDetailModal.displayName = "MemoryDetailModal";

export default MemoryDetailModal;

