import { useState, useEffect, useRef } from "react";
import { Zap, Eye, EyeOff, Camera, ChevronDown, Upload, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "@/services/api";

const ALL_AVATARS = Array.from({ length: 119 }, (_, i) => i + 1)
  .filter(n => ![20, 27, 28].includes(n))
  .map(n => `/avatars/image_${n}.webp`);

const DEFAULT_AVATARS = [
  "/avatars/image_1.webp",
  "/avatars/image_2.webp",
  "/avatars/image_3.webp",
  "/avatars/image_4.webp",
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [role, setRole] = useState("employee");
  const [gender, setGender] = useState("male");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMoreAvatars, setShowMoreAvatars] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setShowMoreAvatars(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarSelect = (path: string) => {
    setAvatar(path);
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
      setAvatar(res.data);
      toast.success("Avatar uploaded successfully");
    } catch (err: any) {
      toast.error("Upload failed: " + (err.response?.data || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await register(firstName, lastName, email, password, gender, role, inviteCode, avatar);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated animate-fade-in">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">TaskFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Create your account</h1>
          <p className="text-center text-sm text-muted-foreground">Start managing your team today</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-sm text-destructive text-center">{error}</div>}

          {/* Avatar Selection Integration */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full border-4 border-primary/30 overflow-hidden bg-muted flex items-center justify-center relative shadow-xl transition-transform hover:scale-105">
                {isUploading ? (
                  <div className="animate-pulse bg-primary/20 h-full w-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary animate-bounce" />
                  </div>
                ) : (
                  <img src={avatar} alt="Preview" className="h-full w-full object-cover" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-all"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
            </div>

            <div className="flex items-center gap-2">
              {DEFAULT_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAvatarSelect(av)}
                  className={`h-10 w-10 rounded-full border-2 transition-all overflow-hidden p-0.5 ${avatar === av ? 'border-primary scale-110 ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={av} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                </button>
              ))}

              <div className="relative" ref={avatarMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowMoreAvatars(!showMoreAvatars)}
                  className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all group"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMoreAvatars ? 'rotate-180' : ''}`} />
                </button>

                {showMoreAvatars && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[60]">
                    {/* Hover preview absolutely positioned to avoid shifting the centered flex box */}
                    {hoveredAvatar && (
                      <div className="hidden sm:block absolute right-[105%] top-0 w-32 h-32 bg-card border-2 border-primary rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 pointer-events-none">
                        <img src={hoveredAvatar} alt="Hover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Main popup */}
                    <div className="w-56 h-64 bg-popover border border-border rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-top-2 overflow-hidden">
                      <div className="p-2 border-b bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground tracking-wider text-center">Library</div>
                      <div className="overflow-y-auto flex-1 grid grid-cols-4 gap-2 p-2 custom-scrollbar">
                        {ALL_AVATARS.map((av, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAvatarSelect(av)}
                            onMouseEnter={() => setHoveredAvatar(av)}
                            onMouseLeave={() => setHoveredAvatar(null)}
                            className="h-10 w-10 rounded-lg overflow-hidden hover:scale-110 transition-transform active:scale-95 border border-border/50 hover:border-primary"
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
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">
              Pick a style or upload your own
            </p>
          </div>
          {error && <div className="text-sm text-destructive text-center">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Position</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div >
    </div >
  );
};

export default Register;
