import { useState, useEffect, useRef } from "react";
import { Zap, Eye, EyeOff, Building2, Users2, Phone, Fingerprint, Camera, Check, ChevronDown, Upload, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { countries, Country } from "../../utils/countryData";
import api from "../../services/api";

// Professional Dicebear Avatar Styles
const DICEBEAR_STYLE = "lorelei"; // Clean, modern, and transparent
const ALL_AVATARS = Array.from({ length: 119 }, (_, i) => i + 1)
    .filter(n => ![20, 27, 28].includes(n))
    .map(n => `/avatars/image_${n}.webp`);

const DEFAULT_AVATARS = [
    "/avatars/image_1.webp",
    "/avatars/image_2.webp",
    "/avatars/image_3.webp",
    "/avatars/image_4.webp",
];

const FlagIcon = ({ code, name, className = "" }: { code: string; name: string; className?: string }) => (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-sm ${className}`}>
        <picture>
            <source
                type="image/webp"
                srcSet={`https://flagcdn.com/36x27/${code.toLowerCase()}.webp,
          https://flagcdn.com/72x54/${code.toLowerCase()}.webp 2x,
          https://flagcdn.com/108x81/${code.toLowerCase()}.webp 3x`} />
            <source
                type="image/png"
                srcSet={`https://flagcdn.com/36x27/${code.toLowerCase()}.png,
          https://flagcdn.com/72x54/${code.toLowerCase()}.png 2x,
          https://flagcdn.com/108x81/${code.toLowerCase()}.png 3x`} />
            <img
                src={`https://flagcdn.com/36x27/${code.toLowerCase()}.png`}
                width="24"
                height="18"
                alt={name}
                className="object-cover"
            />
        </picture>
    </div>
);

const SuperAdminSignup = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [plan, setPlan] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showMoreAvatars, setShowMoreAvatars] = useState(false);
    const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
    const avatarMenuRef = useRef<HTMLDivElement>(null);
    const [countrySearch, setCountrySearch] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        registrationNumber: "",
        companySize: "1-10",
        industry: "Technology",
        country: "India",
        countryCode: "in",
        dialCode: "+91",
        phone: "",
        avatar: "/avatars/image_1.webp"
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const selectedPlan = localStorage.getItem("selectedPlan");
        if (!selectedPlan) {
            toast.error("Please select a plan first");
            navigate("/pricing");
            return;
        }
        setPlan(selectedPlan);

        // Click outside listener for avatar menu
        const handleClickOutside = (event: MouseEvent) => {
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
                setShowMoreAvatars(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCountrySelect = (country: Country) => {
        setFormData(prev => ({
            ...prev,
            country: country.name,
            countryCode: country.code,
            dialCode: country.dialCode
        }));
        setShowCountryDropdown(false);
        setCountrySearch("");
    };

    const handleAvatarSelect = (path: string) => {
        setFormData(prev => ({ ...prev, avatar: path }));
        setShowMoreAvatars(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            setIsUploading(true);
            const res = await api.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar: res.data }));
            toast.success("Avatar uploaded successfully");
        } catch (err: any) {
            toast.error("Upload failed: " + (err.response?.data || err.message));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        const fullPhoneNumber = `${formData.dialCode}${formData.phone}`;
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        localStorage.setItem("pendingSuperAdmin", JSON.stringify({
            ...formData,
            name: fullName,
            phoneNumber: fullPhoneNumber,
            plan
        }));
        navigate("/payment");
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
    );

    return (
        <div className="flex min-h-screen items-center justify-center gradient-hero px-4 py-12">
            <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-8 shadow-elevated animate-fade-in">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl text-foreground">TaskFlow</span>
                    </div>
                    <h1 className="text-3xl font-black text-foreground mb-2">Set up your Organization</h1>
                    <p className="text-sm text-muted-foreground italic">Selected Plan: <span className="text-primary font-bold">{plan}</span></p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Advanced Avatar Selection */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative group">
                            <div className="h-28 w-28 rounded-full border-4 border-primary/30 overflow-hidden bg-muted flex items-center justify-center relative shadow-2xl transition-transform hover:scale-105">
                                {isUploading ? (
                                    <div className="animate-pulse bg-primary/20 h-full w-full flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-primary animate-bounce" />
                                    </div>
                                ) : (
                                    <img src={formData.avatar} alt="Preview" className="h-full w-full object-cover" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-all"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                        </div>

                        <div className="flex flex-col items-center gap-4 w-full max-w-md">
                            <div className="flex items-center gap-3">
                                {DEFAULT_AVATARS.map((av, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAvatarSelect(av)}
                                        className={`h-14 w-14 rounded-full border-2 transition-all overflow-hidden p-0.5 ${formData.avatar === av ? 'border-primary scale-110 ring-4 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={av} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                                    </button>
                                ))}

                                <div className="relative" ref={avatarMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowMoreAvatars(!showMoreAvatars)}
                                        className="h-14 w-14 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all group"
                                    >
                                        <ChevronDown className={`h-6 w-6 transition-transform ${showMoreAvatars ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showMoreAvatars && (
                                        <div className="absolute top-16 right-0 z-[60]">
                                            {/* Left side hover preview */}
                                            {hoveredAvatar && (
                                                <div className="hidden sm:block absolute right-[103%] top-0 w-40 h-40 bg-card border-2 border-primary rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 pointer-events-none">
                                                    <img src={hoveredAvatar} alt="Hover Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            {/* Main popup */}
                                            <div className="w-64 h-72 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
                                                <div className="p-2 border-b bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground tracking-wider text-center">All Avatars</div>
                                                <div className="overflow-y-auto flex-1 grid grid-cols-4 gap-2 p-3 custom-scrollbar">
                                                    {ALL_AVATARS.map((av, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleAvatarSelect(av)}
                                                            onMouseEnter={() => setHoveredAvatar(av)}
                                                            onMouseLeave={() => setHoveredAvatar(null)}
                                                            className="h-12 w-12 rounded-lg overflow-hidden hover:scale-110 transition-transform active:scale-95 border border-border/50 hover:border-primary"
                                                        >
                                                            <img src={av} alt="Avatar" className="h-full w-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                                Choose a default, upload from device, or explore more
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 text-left">
                        {/* Left Column: Personal Profile */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight">Personal Profile</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="John"
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Work Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@company.com"
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="h-11 w-full rounded-xl border border-border bg-surface px-4 pr-12 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Confirm</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Organization Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight">Organization Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="TaskFlow Inc."
                                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                        <Fingerprint className="h-3 w-3" /> Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        placeholder="REG-12345678"
                                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Global Country Selector with Flags */}
                                    <div className="relative">
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                            Country
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium flex items-center justify-between transition-all focus:ring-4 focus:ring-primary/10 text-left overflow-hidden"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <FlagIcon code={formData.countryCode} name={formData.country} className="w-6 h-4" />
                                                <span className="truncate">{formData.country}</span>
                                            </div>
                                            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showCountryDropdown && (
                                            <div className="absolute top-14 left-0 w-full max-h-64 bg-popover border border-border rounded-xl shadow-2xl z-[60] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1">
                                                <div className="p-2 bg-muted/30 border-b flex items-center gap-2">
                                                    <Search className="h-3 w-3 text-muted-foreground" />
                                                    <input
                                                        className="bg-transparent border-none outline-none text-xs w-full py-1"
                                                        placeholder="Search countries..."
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                                    {filteredCountries.map((c) => (
                                                        <button
                                                            key={c.code}
                                                            type="button"
                                                            onClick={() => handleCountrySelect(c)}
                                                            className="w-full px-3 py-2.5 flex items-center gap-3 text-xs font-medium hover:bg-primary/5 transition-colors border-b border-border/10 last:border-none group"
                                                        >
                                                            <FlagIcon code={c.code} name={c.name} className="w-5 h-3.5" />
                                                            <span className="flex-1 text-left truncate group-hover:text-primary">{c.name}</span>
                                                            <span className="text-[10px] text-muted-foreground font-bold">{c.dialCode}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> Contact Number
                                        </label>
                                        <div className="flex items-center h-11 rounded-xl border border-border bg-surface focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary overflow-hidden transition-all">
                                            <div className="px-3 py-2 bg-muted/10 border-r border-border min-w-[55px] text-center text-xs font-bold text-muted-foreground">
                                                {formData.dialCode}
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="9876543210"
                                                className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Company Size</label>
                                        <select
                                            name="companySize"
                                            value={formData.companySize}
                                            onChange={handleChange}
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                        >
                                            <option value="1-10">1-10 People</option>
                                            <option value="11-50">11-50 People</option>
                                            <option value="51-200">51-200 People</option>
                                            <option value="201-500">201-500 People</option>
                                            <option value="500+">500+ People</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase text-muted-foreground tracking-widest">Industry</label>
                                        <select
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                                        >
                                            <option value="Technology">Technology</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Creative">Creative</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t">
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="h-14 w-full rounded-2xl gradient-primary text-xl font-black text-primary-foreground shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale"
                        >
                            {isUploading ? "Finalizing Profile..." : "Secure Account & Continue"}
                        </button>
                        <div className="mt-4 flex flex-col items-center gap-1 opacity-60">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                                🛡️ BANK-GRADE ENCRYPTION & GDPR COMPLIANT
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                By continuing, you agree to our <Link to="/terms" className="underline hover:text-primary">Terms</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm font-bold text-muted-foreground">
                    <Link to="/pricing" className="text-primary hover:underline flex items-center justify-center gap-2">
                        Back to Plans & Pricing
                    </Link>
                </p>
            </div >
        </div >
    );
};

export default SuperAdminSignup;
