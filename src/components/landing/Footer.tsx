import { Zap, Linkedin, Twitter, Github } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = (path: string) => {
    if (path.startsWith("/#")) {
      const id = path.replace("/#", "");
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (location.pathname === path) {
      window.scrollTo(0, 0);
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground mb-4">
              <Zap className="h-5 w-5 text-primary" />
              TaskFlow
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering teams to achieve more with better tools and smarter insights.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => handleLinkClick("/#features")}
                  className="hover:text-foreground text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("/pricing")}
                  className="hover:text-foreground text-left"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("/contact")}
                  className="hover:text-foreground text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact?tab=privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/contact?tab=terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/contact?tab=refund" className="hover:text-foreground">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
