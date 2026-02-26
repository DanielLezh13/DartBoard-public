"use client";

import React from "react";

interface NeonLineBarProps {
  progress: number | null; // null = scanning, number = determinate percentage
  title?: string;
  className?: string;
}

export function NeonLineBar({ progress, title, className = "" }: NeonLineBarProps) {
  const isScanning = progress === null;
  const clamped = progress !== null ? Math.min(Math.max(progress, 0), 100) : 0;

  return (
    <div
      className={`relative w-14 h-1 bg-slate-900/50 rounded-full overflow-hidden ${className}`}
      title={title || (progress !== null ? `Message count: ${clamped}% (of ~80 messages)` : "Scanning...")}
    >
      {isScanning ? (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute h-full w-1/3 bg-gray-600"
            style={{
              animation: "scan 1.6s ease-in-out",
            }}
          />
        </div>
      ) : (
        <div
          className="absolute left-0 top-0 h-full bg-gray-500 border border-gray-600 transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${clamped}%`,
          }}
        />
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            left: -25%;
          }
          50% {
            left: 125%;
          }
          100% {
            left: -25%;
          }
        }
      `}</style>
    </div>
  );
}






