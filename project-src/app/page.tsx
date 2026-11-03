import { AppSection } from "@/components/app-section";
import { Benchmarks } from "@/components/benchmarks";
import { Brief } from "@/components/brief";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Formats } from "@/components/formats";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Nonstandard } from "@/components/nonstandard";
import { Pricing } from "@/components/pricing";
import { StructuredData } from "@/components/structured-data";
import { Testimonials } from "@/components/testimonials";
import { Variations } from "@/components/variations";
import { createMetadata, siteConfig } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Хранилище цифрового искусства",
  description: `${siteConfig.description}`,
  path: "/",
});

export default function HomePage(): ReactNode {
  return (
    <>
      <span id="top" className="sr-only" />
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <Brief />
        <AppSection />
        <Variations />
        <Benchmarks />
        <Nonstandard />
        <Formats />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StructuredData />
    </>
  );
}
