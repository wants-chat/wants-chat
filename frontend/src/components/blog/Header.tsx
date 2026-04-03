
import React, { useState } from "react";
import { Moon, Sun, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../../contexts/ThemeContext";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchCategory, setSearchCategory] = useState("");

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                    <img src="/assets/logo.png" alt="Wants AI" className="h-8 w-8" />
                    <span className="text-xl font-bold text-white">Wants AI Blog</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by category..."
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="pl-10 pr-4 py-2 w-48 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    </div>
                </div>
              </div>
            </nav>
          </header>
  );
};

export default Header;
