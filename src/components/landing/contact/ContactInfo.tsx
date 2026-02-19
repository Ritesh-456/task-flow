import { Mail, Phone, MapPin } from "lucide-react";

const ContactInfo = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">support@taskflow.io</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Location</h3>
                    <p className="text-muted-foreground">Bengaluru, India</p>
                </div>
            </div>
        </div>
    );
};

export default ContactInfo;
