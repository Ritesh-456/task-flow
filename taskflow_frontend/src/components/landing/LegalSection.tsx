import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalSectionProps {
    value?: string;
    onValueChange?: (value: string) => void;
}

const LegalSection = ({ value = "privacy", onValueChange }: LegalSectionProps) => {
    return (
        <section className="py-20 bg-secondary/20" id="legal">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-2xl font-bold mb-8 text-center">Legal Policies</h2>

                <Tabs value={value} onValueChange={onValueChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                        <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                        <TabsTrigger value="refund">Refund Policy</TabsTrigger>
                    </TabsList>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <ScrollArea className="h-[400px] pr-4">
                            <TabsContent value="privacy" className="mt-0">
                                <h3 className="text-xl font-semibold mb-4">Privacy Policy</h3>
                                <p className="text-muted-foreground mb-4">
                                    Last updated: {new Date().toLocaleDateString()}
                                </p>
                                <div className="space-y-4 text-sm leading-relaxed">
                                    <p>At TaskFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our application.</p>
                                    <h4 className="font-semibold text-foreground">1. Collection of Data</h4>
                                    <p>We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website.</p>
                                    <h4 className="font-semibold text-foreground">2. Use of Data</h4>
                                    <p>We use the data to provide and maintain our Service, notify you about changes to our Service, allow you to participate in interactive features of our Service when you choose to do so, provide customer support, gather analysis or valuable information so that we can improve our Service.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="terms" className="mt-0">
                                <h3 className="text-xl font-semibold mb-4">Terms of Service</h3>
                                <p className="text-muted-foreground mb-4">
                                    Last updated: {new Date().toLocaleDateString()}
                                </p>
                                <div className="space-y-4 text-sm leading-relaxed">
                                    <p>Please read these Terms of Service carefully before using the TaskFlow Service.</p>
                                    <h4 className="font-semibold text-foreground">1. Acceptance of Terms</h4>
                                    <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
                                    <h4 className="font-semibold text-foreground">2. Accounts</h4>
                                    <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="refund" className="mt-0">
                                <h3 className="text-xl font-semibold mb-4">Refund Policy</h3>
                                <div className="space-y-4 text-sm leading-relaxed">
                                    <p>We want you to be satisfied with TaskFlow. If you're not happy with the service for any reason, you can contact us within 14 days of your purchase for a full refund.</p>
                                    <h4 className="font-semibold text-foreground">1. Monthly Subscriptions</h4>
                                    <p>You may cancel your monthly subscription at any time. If you cancel within 14 days of your initial purchase, you are eligible for a full refund.</p>
                                    <h4 className="font-semibold text-foreground">2. Annual Subscriptions</h4>
                                    <p>Annual subscriptions are refundable within 30 days of purchase. After 30 days, we do not provide refunds for any unused portion of the term.</p>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </div>
        </section>
    );
};

export default LegalSection;
