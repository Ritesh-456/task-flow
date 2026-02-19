import Navbar from "@/components/landing/Navbar";
import ContactSection from "@/components/landing/ContactSection";
import LegalSection from "@/components/landing/LegalSection";
import Footer from "@/components/landing/Footer";

const Contact = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-20">
                <ContactSection />
                <LegalSection />
            </div>
            <Footer />
        </div>
    );
};

export default Contact;
