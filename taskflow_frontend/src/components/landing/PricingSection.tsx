import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "₹499",
    period: "/month",
    highlighted: false,
    features: [
      "Up to 1 team",
      "1 admin",
      "2 managers",
      "5 employees",
      "Basic analytics",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    highlighted: true,
    features: [
      "Up to 3 teams",
      "3 admins",
      "10 managers",
      "30 employees",
      "Advanced analytics",
      "Real-time notifications",
    ],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    highlighted: false,
    features: [
      "Unlimited teams",
      "Unlimited users",
      "Custom features",
      "Priority support",
      "Dedicated server",
    ],
    cta: "Contact Sales",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Plans for every team size</h2>
          <p className="mt-4 text-muted-foreground">Start free, scale when you're ready.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-primary bg-card shadow-elevated scale-105"
                  : "border-border bg-card shadow-soft"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Recommended
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  plan.highlighted
                    ? "gradient-primary border-0 text-primary-foreground hover:opacity-90 w-full"
                    : "w-full"
                }
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link to={plan.name === "Enterprise" ? "/#contact" : "/signup"}>
                  {plan.cta}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
