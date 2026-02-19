import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PricingCardProps {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    cta: string;
    ctaLink: string;
    delay?: number;
}

const PricingCard = ({
    name,
    price,
    period,
    description,
    features,
    highlighted = false,
    cta,
    ctaLink,
    delay = 0
}: PricingCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${highlighted
                ? "border-primary bg-card shadow-elevated scale-100 md:scale-105 z-10"
                : "border-border bg-card/50 shadow-soft hover:shadow-card hover:-translate-y-1"
                }`}
        >
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-sm font-semibold text-primary-foreground shadow-lg flex items-center gap-1.5">
                    <Zap className="h-4 w-4 fill-current" /> Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{name}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>

            <div className="mb-8 group/price cursor-default">
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-foreground tracking-tight transition-all duration-300 group-hover/price:text-primary group-hover/price:scale-110 origin-left inline-block">{price}</span>
                    <span className="text-muted-foreground font-medium transition-colors group-hover/price:text-foreground">{period}</span>
                </div>
            </div>

            <div className="flex-1 mb-8">
                <ul className="space-y-4">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <div className={`mt-1 rounded-full p-0.5 ${highlighted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Button
                asChild
                size="lg"
                className={`w-full text-base font-semibold h-12 ${highlighted
                    ? "gradient-primary border-0 text-primary-foreground shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                variant={highlighted ? "default" : "outline"}
            >
                <Link to={ctaLink}>
                    {cta}
                </Link>
            </Button>
        </motion.div>
    );
};

export default PricingCard;
