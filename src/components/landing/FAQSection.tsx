import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Is there a free trial?",
        answer: "Yes, all paid plans come with a 14-day free trial. No credit card required.",
    },
    {
        question: "Can I change plans anytime?",
        answer: "Absolutely. You can upgrade or downgrade your plan from the settings menu at any time.",
    },
    {
        question: "How does the invite system work?",
        answer: "Admins generate secure invite codes that role-assign new users automatically. This ensures strict hierarchy control.",
    },
    {
        question: "Do you offer enterprise support?",
        answer: "Yes, our Enterprise plan includes dedicated 24/7 support and a dedicated account manager.",
    },
];

const FAQSection = () => {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-left text-lg">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQSection;
