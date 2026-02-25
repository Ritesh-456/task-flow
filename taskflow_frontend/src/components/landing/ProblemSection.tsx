import { AlertTriangle, Clock, Search } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
    {
        icon: AlertTriangle,
        title: "Chaos & Confusion",
        description: "Tasks get lost in email threads and spreadsheats. No one knows who is working on what.",
    },
    {
        icon: Search,
        title: "Lack of Visibility",
        description: "Managers struggle to track progress and identify bottlenecks in real-time.",
    },
    {
        icon: Clock,
        title: "Missed Deadlines",
        description: "Without clear priorities and tracking, projects slip and deadlines are missed.",
    },
];

const ProblemSection = () => {
    return (
        <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        Is your team struggling to keep up?
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                        Traditional project management methods are failing modern teams.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {problems.map((problem, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-card p-8 rounded-2xl shadow-sm border border-border text-center"
                        >
                            <div className="inline-flex items-center justify-center p-3 rounded-full bg-destructive/10 mb-6">
                                <problem.icon className="h-8 w-8 text-destructive" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{problem.title}</h3>
                            <p className="text-muted-foreground">{problem.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
