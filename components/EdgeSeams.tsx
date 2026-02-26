"use client";

export function EdgeSeams({ 
  showLeft, 
  showRight 
}: { 
  showLeft: boolean;
  showRight: boolean;
}) {
  return (
    <>
      {/* Left seam - gradient overlay fading to the right */}
      <div
        data-edge-seam="left"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: "12px",
          pointerEvents: "none",
          zIndex: 999999,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 100%)",
          opacity: showLeft ? 1 : 0,
          transition: "opacity 300ms",
        }}
      />
      
      {/* Right seam - gradient overlay fading to the left */}
      <div
        data-edge-seam="right"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "12px",
          pointerEvents: "none",
          zIndex: 999999,
          background:
            "linear-gradient(to left, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 100%)",
          opacity: showRight ? 1 : 0,
          transition: "opacity 300ms",
        }}
      />
    </>
  );
}

