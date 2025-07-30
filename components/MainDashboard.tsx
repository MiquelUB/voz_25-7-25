import { Header } from "@/components/Header";
import DayFocus from "@/components/DayFocus";
import CalendarModule from "@/components/CalendarModule";
import { ReportModule } from "@/components/ReportModule";
import { SearchModule } from "@/components/SearchModule";

const MainDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Principal con navegación e identidad de marca */}
      <Header />

      {/* Puesto de Mando Clínico - Layout principal */}
      <main className="h-[calc(100vh-80px)] flex gap-6 p-6">
        {/* Columna Izquierda - Foco del Día (70% width) */}
        <div className="w-[70%]">
          <DayFocus />
        </div>

        {/* Columna Derecha - Calendario (30% width) */}
        <div className="w-[30%]">
          <CalendarModule />
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;