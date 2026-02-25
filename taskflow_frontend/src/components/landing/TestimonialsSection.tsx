import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "TaskFlow improved our team productivity by 40%. It's strictly organized yet incredibly flexible.",
        author: "Sarah J.",
        role: "Product Manager",
        company: "TechCorp",
    },
    {
        quote: "Finally, a tool that respects hierarchy and permissions. Onboarding new employees is a breeze now.",
        author: "Michael T.",
        role: "Engineering Lead",
        company: "DevSystems",
    },
    {
        quote: "The AI suggestions are surprisingly accurate. It saves me hours of planning every week.",
        author: "Emily R.",
        role: "Operations Director",
        company: "LogiStream",
    },
];

const TestimonialsSection = () => {
    return (
        <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        Trusted by modern teams
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        See what our users have to say about TaskFlow.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card p-8 rounded-2xl shadow-sm border border-border flex flex-col"
                        >
                            <div className="flex gap-1 text-yellow-500 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <blockquote className="flex-1 text-lg mb-6 leading-relaxed">
                                "{t.quote}"
                            </blockquote>
                            <div>
                                <div className="font-semibold text-foreground">{t.author}</div>
                                <div className="text-sm text-muted-foreground">{t.role}, {t.company}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
