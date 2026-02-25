import { CheckCircle2, Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
    {
        icon: CheckCircle2,
        title: "Real-time Tracking",
        description: "See exactly what's happening right now. Updates are instant across all devices.",
    },
    {
        icon: Layers,
        title: "Hierarchical Control",
        description: "Organize teams deeply with our purpose-built role and permission system.",
    },
    {
        icon: Zap,
        title: "Smart Assignment",
        description: "AI-powered suggestions help you assign the right task to the right person.",
    },
];

const SolutionSection = () => {
    return (
        <section className="py-20 bg-background text-foreground">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold sm:text-4xl mb-6"
                        >
                            A smarter way to manage work
                        </motion.h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            TaskFlow brings order to chaos with a structured, intelligent approach to project management.
                        </p>

                        <div className="space-y-6">
                            {solutions.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="flex gap-4"
                                >
                                    <div className="mt-1">
                                        <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10">
                                            <item.icon className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="md:w-1/2">
                        {/* Placeholder for an image or graphic */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card h-[400px] flex items-center justify-center gradient-hero">
                            <span className="text-muted-foreground font-medium">Solution Interface Preview</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
