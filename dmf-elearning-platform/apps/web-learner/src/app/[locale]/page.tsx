import {
  Navbar,
  HeroSection,
  BentoGrid,
  CourseShowcase,
  AISenseiDemo,
  SocialProof,
  CTASection,
  Footer,
} from '@/components/homepage';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50/30">
      <Navbar />
      <HeroSection />
      <BentoGrid />
      <CourseShowcase />
      <AISenseiDemo />
      <SocialProof />
      <CTASection />
      <Footer />
    </main>
  );
}
