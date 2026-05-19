"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

import BenefitsHero from "@/components/landing/benefits/BenefitsHero";
import BenefitsGrid from "@/components/landing/benefits/BenefitsGrid";
import BenefitsStats from "@/components/landing/benefits/BenefitsStats";
import BenefitsCTA from "@/components/landing/benefits/BenefitsCTA";

export default function BeneficiosPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#fff4e2" }}
    >
      <Navbar />

      <main className="flex-1 pt-32">

        <BenefitsHero />

        <BenefitsGrid />

        <BenefitsStats />

        <BenefitsCTA />

      </main>

      <Footer />
    </div>
  );
}