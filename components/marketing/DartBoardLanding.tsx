import { HeroSection } from "@/components/hero-section";
import { ProblemSolutionSection } from "@/components/problem-solution-section";
import { ChatModesSection } from "@/components/chat-modes-section";
import { MemoriesSection } from "@/components/memories-section";
import { ArchiveSection } from "@/components/archive-section";
import { LayoutPreviewSection } from "@/components/layout-preview-section";
import { Footer } from "@/components/footer";

export function DartBoardLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[#0a0b10]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(77,127,255,0.15),_transparent_50%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(77,127,255,0.1),_transparent)]" />

      <HeroSection />
      <ProblemSolutionSection />
      <MemoriesSection />
      <ChatModesSection />
      <ArchiveSection />
      <LayoutPreviewSection />
      <Footer />
    </main>
  );
}
