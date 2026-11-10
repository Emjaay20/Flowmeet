import Header from "./components/Header";
import InteractiveWidget from "./components/InteractiveWidget";
import FourStepsSection from "./components/FourStepsSection";
import VpsSpecsSection from "./components/VpsSpecsSection";
import PricingSection from "./components/PricingSection";
import EmbedSection from "./components/EmbedSection";
import Footer from "./components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#fcfcf9] text-zinc-900 selection:bg-[#c8f944] selection:text-zinc-950 font-sans antialiased">
            {/* Editorial Glass Navigation */}
            <Header />

            {/* 01. Hero with Interactive Live Input & SSE Streamed Terminal */}
            <InteractiveWidget />

            {/* 02. Verifiable 4-Step Pipeline: Rust, Go, Cal.com, Python */}
            <FourStepsSection />

            {/* 03.System Specs: 1GB Oracle VPS & Memory Breakdown Bar */}
            <VpsSpecsSection />

            {/* 04. Transparent Stubbed Pricing: Usage API, Success Fee, White-Label */}
            <PricingSection />

            {/* 05. 1-Line JavaScript Embed + Live Visitor Preview */}
            <EmbedSection />

            {/* 06.Editorial Footer with System Disclosure & Telemetry */}
            <Footer />
        </main>
    );
}
