import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ContactHeader from "@/components/landing/contact/ContactHeader";
import ContactInfo from "@/components/landing/contact/ContactInfo";
import SupportCards from "@/components/landing/contact/SupportCards";
import ContactForm from "@/components/landing/contact/ContactForm";
import LegalSection from "@/components/landing/LegalSection";
import FAQSection from "@/components/landing/FAQSection";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Contact = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab") || "privacy";

    useEffect(() => {
        if (searchParams.get("tab")) {
            const element = document.getElementById("legal");
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4">
                    <ContactHeader />

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-20">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <ContactInfo />
                            <SupportCards />
                        </div>

                        {/* Right Column */}
                        <div>
                            <ContactForm defaultSubject={searchParams.get("subject") || ""} />
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-20">
                        <LegalSection value={tab} onValueChange={handleTabChange} />
                        <FAQSection />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
