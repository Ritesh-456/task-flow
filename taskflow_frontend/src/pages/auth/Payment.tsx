import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, ShieldCheck, Loader2, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Payment = () => {
    const { superAdminRegister } = useAuth();
    const navigate = useNavigate();
    const [pendingData, setPendingData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem("pendingSuperAdmin");
        if (!data) {
            toast.error("Signup progress lost. Please start again.");
            navigate("/pricing");
            return;
        }
        setPendingData(JSON.parse(data));
    }, [navigate]);

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const success = await superAdminRegister(pendingData);
            if (success) {
                setIsSuccess(true);
                localStorage.removeItem("pendingSuperAdmin");
                localStorage.removeItem("selectedPlan");

                toast.success("Payment Successful!");

                // Show success UI for 2 seconds before redirecting
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            }
        } catch (error) {
            toast.error("Failed to complete setup after payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!pendingData) return null;

    const planPrices: Record<string, string> = {
        "BASIC": "₹499",
        "PRO": "₹1,499",
        "ENTERPRISE": "Custom"
    };

    return (
        <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="payment-form"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-8"
                        >
                            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Secure Payment</h1>
                                    <p className="text-sm text-muted-foreground">Complete your subscription setup</p>
                                </div>
                            </div>

                            <div className="mb-8 space-y-4">
                                <div className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Selected Plan</p>
                                        <p className="text-lg font-bold text-primary">{pendingData.plan}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-muted-foreground">Monthly Total</p>
                                        <p className="text-2xl font-black">{planPrices[pendingData.plan] || "₹499"}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                        <span>Encrypted 256-bit safe checkout</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Instant access to dashboard</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing Securely...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Pay {planPrices[pendingData.plan] || "₹499"}
                                    </>
                                )}
                            </button>

                            <p className="mt-6 text-center text-xs text-muted-foreground">
                                This is a payment simulation. No actual money will be charged.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center flex flex-col items-center"
                        >
                            <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-2 text-foreground">Welcome to TaskFlow!</h2>
                            <p className="text-muted-foreground text-lg mb-8">Payment Successful! Your organization is ready.</p>
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Redirecting to Dashboard...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Payment;
