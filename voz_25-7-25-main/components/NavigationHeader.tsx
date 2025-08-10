import { Menu, User, Search, Calendar, Users, Plus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

export const NavigationHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-card border-b border-module-border px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="hover:opacity-80 transition-calm">
          <h1 className="text-2xl font-serif font-semibold text-primary tracking-wide">
            iNFORiA
          </h1>
        </Link>
      </div>

      {/* Search Bar - Center */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes, informes..."
            className="pl-10 bg-secondary border-module-border focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Navigation Icons & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Main Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-secondary transition-calm"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-module-border">
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
              <Link to="/" className="w-full flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
              <Link to="/patient-list" className="w-full flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Pacientes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
              <Link to="/new-patient" className="w-full flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Crear Ficha de Paciente
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-sans cursor-pointer hover:bg-secondary">
              <Link to="/faqs" className="w-full flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar - Direct Link */}
        <Link to="/my-account">
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="Usuario" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </Link>
      </div>
    </header>
  );
};