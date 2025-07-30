import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CalendarDay {
  date: number;
  hasAppointments: boolean;
  appointments?: Array<{
    time: string;
    patientName: string;
  }>;
}

const CalendarModule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Ajuste para que lunes sea 0

    const days: CalendarDay[] = [];

    // Add empty days for the beginning of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: 0, hasAppointments: false });
    }

    // Add days of the month with mock appointment data
    for (let day = 1; day <= daysInMonth; day++) {
      const hasAppointments = day === 22 || day === 25 || day === 28; // Mock data
      const appointments = hasAppointments ? [
        { time: "10:00", patientName: "Paz García" },
        { time: "12:30", patientName: "Marcos Alonso" }
      ] : undefined;

      days.push({
        date: day,
        hasAppointments,
        appointments
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // +1 because getMonth() returns 0-11
    const dateParam = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    navigate(`/new-patient?date=${dateParam}`);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="bg-card rounded-lg border border-module-border p-4 w-full h-full flex flex-col">
      {/* Title */}
      <h3 className="font-serif text-lg font-medium text-foreground mb-4 text-center">
        Calendario
      </h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 bg-background rounded-lg p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-semibold text-foreground px-2">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-primary py-2 bg-background rounded">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center relative min-h-[32px]">
            {day.date > 0 && (
              <>
                {day.hasAppointments && day.appointments ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button 
                        onClick={() => handleDayClick(day.date)}
                        className="w-full h-full flex items-center justify-center text-sm font-medium text-foreground hover:bg-calendar-hover rounded transition-calm relative bg-background border border-transparent hover:border-primary"
                      >
                        {day.date}
                        <div 
                          className="absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm bg-burgundy"
                        />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto p-3" side="top">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs text-foreground mb-2">Citas del día</h4>
                        {day.appointments.map((appointment, idx) => (
                          <div key={idx} className="text-xs p-2 bg-background rounded border">
                            <span className="font-medium text-primary">{appointment.time}</span> - 
                            <button 
                              onClick={() => navigate('/patient-detailed-profile')}
                              className="text-foreground hover:text-primary hover:underline transition-colors ml-1"
                            >
                              {appointment.patientName}
                            </button>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <button 
                    onClick={() => handleDayClick(day.date)}
                    className="w-full h-full flex items-center justify-center text-sm font-medium text-foreground hover:bg-calendar-hover rounded transition-calm bg-background border border-transparent hover:border-muted"
                  >
                    {day.date}
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarModule;