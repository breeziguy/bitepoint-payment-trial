import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar-background border-t border-sidebar-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-sidebar-foreground">Dish Director</h3>
            <p className="text-sm text-sidebar-foreground/80">
              Streamline your restaurant operations with our comprehensive food ordering system.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/80">
              <li><Link to="/" className="hover:text-sidebar-primary">Home</Link></li>
              <li><Link to="/login" className="hover:text-sidebar-primary">Login</Link></li>
              <li><a href="#features" className="hover:text-sidebar-primary">Features</a></li>
              <li><a href="#pricing" className="hover:text-sidebar-primary">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/80">
              <li>Email: support@dishdirector.com</li>
              <li>Phone: +234 123 456 7890</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-sidebar-border">
          <p className="text-center text-sm text-sidebar-foreground/80">
            © {currentYear} Dish Director. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}