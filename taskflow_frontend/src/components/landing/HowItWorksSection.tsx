import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Create Team", description: "Set up your organization and define the team structure in minutes." },
  { step: "02", title: "Invite Members", description: "Share a unique invite code with your team. They join instantly — no emails needed." },
  { step: "03", title: "Assign Tasks", description: "Create and assign tasks to the right people with deadlines and priorities." },
  { step: "04", title: "Track Performance", description: "Monitor completion rates, review quality, and rate team member performance." },
  { step: "05", title: "Monitor Analytics", description: "Gain insights from dashboards showing productivity trends and team health." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Get started in 5 simple steps</h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-6 items-start rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-sm">
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
