import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-primary/90 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Start managing your team smarter today
                    </h2>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                        Join thousands of teams who have transformed their workflow with TaskFlow.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-xl">
                            <Link to="/signup">
                                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                            <Link to="/contact">
                                Contact Sales
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
