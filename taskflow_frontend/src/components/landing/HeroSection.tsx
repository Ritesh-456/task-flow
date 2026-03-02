import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// Vite will statically bundle these images when explicitly imported.
import lightDashboardImg from "@/assets/light_dashboard.png";
import darkDashboardImg from "@/assets/dark_dashboard.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full gradient-primary blur-[100px]" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 opacity-20 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full gradient-accent blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 text-center">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 shadow-sm text-sm font-medium"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            <span className="text-foreground">TaskFlow v2.0 is now live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
          >
            Manage tasks with <br className="hidden md:block" />
            <span className="text-gradient">unprecedented clarity</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            The intelligent productivity suite designed for modern teams. Streamline workflows, eliminate chaos, and deliver projects faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="px-8 text-base shadow-elevated transition-transform hover:scale-105">
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 text-base">
              <Link to="/contact?subject=demo">
                Request Demo
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="rounded-xl border border-border bg-card p-2 shadow-elevated">
            <img
              src={lightDashboardImg}
              alt="TaskFlow dashboard preview light"
              className="rounded-lg w-full dark:hidden"
              loading="lazy"
            />
            <img
              src={darkDashboardImg}
              alt="TaskFlow dashboard preview dark"
              className="rounded-lg w-full hidden dark:block"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
