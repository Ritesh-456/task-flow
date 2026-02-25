import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PricingHeader from "@/components/landing/pricing/PricingHeader";
import PricingCard from "@/components/landing/pricing/PricingCard";

const plans = [
    {
        name: "Basic",
        price: "₹499",
        period: "/month",
        description: "Essential tools for small teams getting started.",
        highlighted: false,
        features: [
            "Up to 1 team",
            "1 admin account",
            "2 manager accounts",
            "5 employee seats",
            "7-day activity history",
            "Basic performance analytics",
            "Email support"
        ],
        cta: "Get Started",
        ctaLink: "/super-admin-signup"
    },
    {
        name: "Pro",
        price: "₹1,499",
        period: "/month",
        description: "Advanced features for growing businesses.",
        highlighted: true,
        features: [
            "Up to 3 teams",
            "3 admin accounts",
            "10 manager accounts",
            "30 employee seats",
            "Unlimited activity history",
            "Advanced analytics & insights",
            "Real-time notifications",
            "Priority email support"
        ],
        cta: "Get Started",
        ctaLink: "/super-admin-signup"
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "Tailored solutions for large organizations.",
        highlighted: false,
        features: [
            "Unlimited teams",
            "Unlimited users",
            "Custom roles & permissions",
            "Advanced security policies",
            "Audit logs & compliance",
            "Dedicated account manager",
            "24/7 Phone & Slack support",
            "On-premise deployment option"
        ],
        cta: "Contact Sales",
        ctaLink: "/contact?subject=sales"
    },
];

const Pricing = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-20">
                <div className="container mx-auto px-4">
                    <PricingHeader />

                    <div className="max-w-7xl mx-auto mb-32">
                        <div className="grid gap-8 lg:gap-12 md:grid-cols-3 items-start">
                            {plans.map((plan, i) => (
                                <PricingCard key={plan.name} {...plan} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>


                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Pricing;
