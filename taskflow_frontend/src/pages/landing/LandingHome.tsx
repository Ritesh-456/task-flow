import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const LandingHome = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default LandingHome;
