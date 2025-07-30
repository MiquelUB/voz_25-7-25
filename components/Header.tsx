
import { Search, User, Calendar, FileText, Settings, HelpCircle, LogOut, Users, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="h-20 bg-background border-b border-module-border px-8 flex items-center justify-between shadow-sm">
      {/* Logo e Identidad de Marca */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:opacity-80 transition-calm">
          <div className="flex items-center">
            <h1 className="text-3xl font-serif font-medium text-primary tracking-tight">
              iNFORiA
            </h1>
          </div>
        </Link>
      </div>

      {/* Barra de Búsqueda Global */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Buscar paciente, informe, cita..."
            className="pl-12 pr-4 py-3 bg-secondary/50 border-module-border focus:bg-background focus:border-primary transition-calm font-sans rounded-lg"
          />
        </div>
      </div>

      {/* Navegación y Perfil */}
      <div className="flex items-center space-x-4">
        
        {/* Menú de Navegación */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-secondary transition-calm">
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-background border-module-border shadow-lg" align="end">
            <DropdownMenuItem className="font-sans cursor-pointer" asChild>
              <Link to="/" className="w-full flex items-center">
                <Calendar className="mr-3 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer" asChild>
              <Link to="/patient-list" className="w-full flex items-center">
                <Users className="mr-3 h-4 w-4" />
                Mis Pacientes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer" asChild>
              <Link to="/new-patient" className="w-full flex items-center">
                <Plus className="mr-3 h-4 w-4" />
                Nuevo Paciente
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer" asChild>
              <Link to="/faqs" className="w-full flex items-center">
                <HelpCircle className="mr-3 h-4 w-4" />
                FAQs
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-secondary transition-calm">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary font-serif font-medium">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-background border-module-border shadow-lg" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-4">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium font-sans text-foreground">Dr. Usuario</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground font-sans">
                  usuario@psicologia.com
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-sans cursor-pointer" asChild>
              <Link to="/my-account" className="w-full flex items-center">
                <User className="mr-3 h-4 w-4" />
                Mi Cuenta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-sans cursor-pointer">
              <Settings className="mr-3 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-sans cursor-pointer text-burgundy hover:text-burgundy-foreground hover:bg-burgundy">
              <LogOut className="mr-3 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
