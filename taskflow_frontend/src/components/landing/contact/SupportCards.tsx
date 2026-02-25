import { MessageSquare, Wrench, HelpCircle } from "lucide-react";

const SupportCards = () => {
    return (
        <div className="grid gap-4 mt-8">
            <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Sales Inquiry</h3>
                </div>
                <p className="text-sm text-muted-foreground">Interested in our plans? Contact sales team.</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                    <Wrench className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Technical Support</h3>
                </div>
                <p className="text-sm text-muted-foreground">Facing issues? Our support team is here.</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                    <HelpCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">General Questions</h3>
                </div>
                <p className="text-sm text-muted-foreground">Have questions? Reach out anytime.</p>
            </div>
        </div>
    );
};

export default SupportCards;
