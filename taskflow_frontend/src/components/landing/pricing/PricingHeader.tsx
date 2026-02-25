import { motion } from "framer-motion";

const PricingHeader = () => {
    return (
        <div className="text-center mb-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6 uppercase tracking-wider"
            >
                Pricing Plans
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6"
            >
                Plans for every team size
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
                Choose the plan that fits your team's needs. Start free and scale as you grow.
                No hidden fees, cancel anytime.
            </motion.p>
        </div>
    );
};

export default PricingHeader;
