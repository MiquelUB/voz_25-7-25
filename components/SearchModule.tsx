import { useState } from "react";
import { Search, User, FileText, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const SearchModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults] = useState([
    {
      id: 1,
      type: "patient",
      title: "Ana María González",
      subtitle: "Paciente activo",
      icon: User,
      lastUpdate: "Hace 2 días"
    },
    {
      id: 2,
      type: "report",
      title: "Informe de evaluación inicial",
      subtitle: "Juan Carlos Pérez",
      icon: FileText,
      lastUpdate: "Hace 1 semana"
    },
    {
      id: 3,
      type: "appointment",
      title: "Sesión terapéutica",
      subtitle: "Hoy, 16:00",
      icon: Calendar,
      lastUpdate: "Programada"
    }
  ]);

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-module-background border-module-border p-4 rounded-xl h-full flex flex-col">
      <h2 className="font-serif text-lg font-medium text-foreground mb-4">Búsqueda</h2>
      
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm border-module-border focus:ring-primary focus:border-primary font-sans bg-card"
        />
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-hidden">
        {searchQuery && (
          <div className="space-y-2 max-h-full overflow-y-auto custom-scrollbar">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => {
                const IconComponent = result.icon;
                return (
                  <div
                    key={result.id}
                    className="flex items-center space-x-2 p-2 bg-card rounded border border-module-border hover:bg-secondary transition-calm cursor-pointer"
                  >
                    <div className="p-1.5 bg-primary/10 rounded">
                      <IconComponent className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="font-sans text-xs">
                  Sin resultados
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Access */}
        {!searchQuery && (
          <div className="space-y-2">
            <h3 className="font-sans font-medium text-xs text-muted-foreground mb-2">
              Acceso rápido
            </h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 p-2 bg-card rounded border border-module-border hover:bg-secondary transition-calm cursor-pointer">
                <div className="p-1.5 bg-primary/10 rounded">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-xs font-medium text-foreground">
                    Todos los pacientes
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-card rounded border border-module-border hover:bg-secondary transition-calm cursor-pointer">
                <div className="p-1.5 bg-primary/10 rounded">
                  <FileText className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-xs font-medium text-foreground">
                    Informes recientes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};