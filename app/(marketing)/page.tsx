import { HeroSection } from "@/components/hero-section"
import { ProblemSolutionSection } from "@/components/problem-solution-section"
import { ChatModesSection } from "@/components/chat-modes-section"
import { MemoriesSection } from "@/components/memories-section"
import { ArchiveSection } from "@/components/archive-section"
import { LayoutPreviewSection } from "@/components/layout-preview-section"
import { Footer } from "@/components/footer"

export default function DartBoardLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background stack */}
      <div className="absolute inset-0 -z-10 db-marketing-bg" />
      <div className="absolute inset-0 -z-10 db-marketing-bg-noise" />
      
      <HeroSection />
      <ProblemSolutionSection />
      <MemoriesSection />
      <ChatModesSection />
      <ArchiveSection />
      <LayoutPreviewSection />
      <Footer />
    </main>
  )
}
