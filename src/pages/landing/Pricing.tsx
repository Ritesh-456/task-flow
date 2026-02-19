import Navbar from "@/components/landing/Navbar";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

const Pricing = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-20">
                <PricingSection />
                <FAQSection />
            </div>
            <Footer />
        </div>
    );
};

export default Pricing;
