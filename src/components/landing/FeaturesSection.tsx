import { Users, Shield, KeyRound, Star, Clock, Brain, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Users, title: "Real-time Collaboration", description: "Work together with your team in real-time. See updates instantly across all devices." },
  { icon: Shield, title: "Role-based Hierarchy", description: "Define clear roles — admins, managers, and employees — with granular permission control." },
  { icon: KeyRound, title: "Invite Code Onboarding", description: "Onboard team members seamlessly with unique invite codes. No friction, instant access." },
  { icon: Star, title: "Performance Tracking", description: "Rate and review team performance with built-in scoring and feedback systems." },
  { icon: Clock, title: "Availability Tracking", description: "Know who's available in real-time. Schedule tasks based on team capacity." },
  { icon: Brain, title: "Smart Task Assignment", description: "Intelligently assign tasks based on skills, availability, and workload balance." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Visualize team productivity, task completion rates, and performance trends." },
  { icon: Sparkles, title: "AI-powered Suggestions", description: "Get intelligent recommendations for task priorities, deadlines, and team allocation." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Everything you need to manage your team</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Powerful tools designed to streamline your workflow and boost team productivity.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-card hover:-translate-y-1"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg gradient-primary">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
