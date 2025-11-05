

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sprout, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ✅ Extend window type for Google Translate
declare global {
  interface Window {
    google: any;
  }
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/schemes", label: "Schemes" },
        { href: "/weather", label: "Weather" },
        { href: "/mandi-prices", label: "Mandi Prices" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/login", label: "Login" },
      ];

  const isActive = (path: string) => location.pathname === path;

  // ✅ Handle Language Change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);

    if (window.google && window.google.translate) {
      const frame = document.querySelector("iframe");
      if (frame instanceof HTMLIFrameElement) {
        const innerDoc = frame.contentDocument || frame.contentWindow?.document;
        const select = innerDoc?.querySelector(
          ".goog-te-combo"
        ) as HTMLSelectElement | null;
        if (select) {
          select.value = selectedLang;
          select.dispatchEvent(new Event("change"));
        }
      }
    }
  };

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">FarmAssist</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? "text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* ✅ Language Selector */}
            <select
              value={language}
              onChange={handleLanguageChange}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="pa">Punjabi</option>
            </select>

            {user && (
              <div className="flex items-center space-x-4">
                {/* ✅ Desktop Profile button now works */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.href) ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* ✅ Mobile Language Selector */}
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="te">Telugu</option>
                    <option value="ta">Tamil</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                    <option value="pa">Punjabi</option>
                  </select>

                  {user && (
                    <div className="pt-4 border-t space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/profile");
                          setIsOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
