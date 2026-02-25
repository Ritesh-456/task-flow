import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ContactFormProps {
    defaultSubject?: string;
}

const ContactForm = ({ defaultSubject = "" }: ContactFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: defaultSubject,
        message: ""
    });

    // Update form data when defaultSubject changes
    if (defaultSubject && formData.subject === "" && defaultSubject !== formData.subject) {
        setFormData(prev => ({ ...prev, subject: defaultSubject }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-soft">
            <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <Select
                    value={formData.subject}
                    onValueChange={(val) => setFormData({ ...formData, subject: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="demo">Request a Demo</SelectItem>
                        <SelectItem value="sales">Sales Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <Textarea
                    placeholder="How can we help you?"
                    className="min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                />
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                {isLoading ? "Sending..." : (
                    <>
                        Send Message <Send className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
};

export default ContactForm;
