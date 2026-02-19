import { motion } from "framer-motion";

const ContactHeader = () => {
    return (
        <div className="text-center mb-12">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4"
            >
                Get in Touch
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
                We’re here to help you manage your teams better. Reach out anytime.
            </motion.p>
        </div>
    );
};

export default ContactHeader;
