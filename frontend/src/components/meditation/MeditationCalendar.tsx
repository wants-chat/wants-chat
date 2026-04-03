import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Icon from '@mdi/react';
import {
  mdiCalendarMonth,
  mdiClose,
  mdiMeditation,
  mdiEmoticonHappy,
  mdiEmoticonNeutral,
  mdiEmoticonSad,
} from '@mdi/js';

interface SessionDetail {
  type: string;
  duration: number;
  time: string;
  mood: {
    before: number;
    after: number;
  };
}

interface HistoryEntry {
  date: Date;
  sessions: SessionDetail[];
}

interface MeditationCalendarProps {
  meditationHistory: HistoryEntry[];
  sessionsLoading?: boolean;
}

export const MeditationCalendar: React.FC<MeditationCalendarProps> = ({
  meditationHistory,
  sessionsLoading = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get mood icon based on mood value
  const getMoodIcon = (mood?: number) => {
    if (!mood && mood !== 0) return null;
    if (mood >= 7) return <Icon path={mdiEmoticonHappy} size={0.7} className="text-green-500" />;
    if (mood >= 4) return <Icon path={mdiEmoticonNeutral} size={0.7} className="text-yellow-500" />;
    return <Icon path={mdiEmoticonSad} size={0.7} className="text-red-500" />;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getSessionsForDate = (date: Date) => {
    const dateString = date.toDateString();
    const found = meditationHistory.find((h) => h.date.toDateString() === dateString);
    return found;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20 col-span-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Icon path={mdiCalendarMonth} size={0.8} className="text-teal-400" />
          Meditation History
          {sessionsLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400 ml-2"></div>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-32 text-center text-white">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <Button
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200 disabled:opacity-50"
            disabled={
              currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2 sm:space-y-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] sm:text-sm font-medium text-white/60 py-1 sm:py-2"
            >
              {day.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }, (_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const sessionData = getSessionsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const todayDate = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
            );
            const currentDate = new Date(currentYear, currentMonth, day);
            const isFuture = currentDate > todayDate;

            return (
              <div
                key={day}
                className={`
                  relative h-10 sm:h-12 rounded-md sm:rounded-lg border sm:border-2 transition-all
                  ${
                    isFuture
                      ? 'cursor-not-allowed opacity-40 border-white/10 bg-white/5'
                      : 'cursor-pointer hover:border-teal-500/30'
                  }
                  ${
                    !isFuture && isSelected
                      ? 'border-teal-500 bg-teal-500/20 shadow-md'
                      : !isFuture && isToday
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : !isFuture
                      ? 'border-white/20'
                      : ''
                  }
                `}
                onClick={() => {
                  if (!isFuture) {
                    setSelectedDate(date);
                  }
                }}
              >
                <div
                  className={`absolute top-0.5 sm:top-1 left-1 sm:left-2 text-[10px] sm:text-sm font-medium text-white ${
                    isFuture ? 'text-white/30' : ''
                  }`}
                >
                  {day}
                </div>

                {/* Session count indicator */}
                {!isFuture && (
                  <div className="absolute bottom-0.5 right-1 sm:bottom-1 sm:right-2">
                    <div
                      className={`text-[10px] sm:text-xs font-bold rounded-full px-1 py-0.5 ${
                        sessionData && sessionData.sessions.length > 0
                          ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white/80'
                          : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white/60'
                      }`}
                      title={
                        sessionData && sessionData.sessions.length > 0
                          ? `${sessionData.sessions.length} session${
                              sessionData.sessions.length > 1 ? 's' : ''
                            }: ${sessionData.sessions.reduce(
                              (acc, s) => acc + s.duration,
                              0,
                            )} min total`
                          : 'No sessions'
                      }
                    >
                      {sessionData ? sessionData.sessions.length : 0} sessions
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="mt-8 p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-teal-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Icon path={mdiCalendarMonth} size={1} className="text-teal-400" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-white">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                <p className="text-sm text-white/60">{selectedDate.getFullYear()}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setSelectedDate(null)}
              className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
            >
              <Icon path={mdiClose} size={0.6} className="mr-1" />
              Close
            </Button>
          </div>

          {(() => {
            const sessionData = getSessionsForDate(selectedDate);

            const todayDate = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
            );
            const selectedDateOnly = new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
            );
            const isFutureDate = selectedDateOnly > todayDate;

            if (!sessionData || sessionData.sessions.length === 0) {
              return (
                <div className="text-center py-6">
                  <Icon
                    path={mdiMeditation}
                    size={2}
                    className="text-white/30 mx-auto mb-3"
                  />
                  <p className="text-white/60 mb-4">
                    {isFutureDate
                      ? 'Future date - no data available'
                      : 'No meditation sessions on this day'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {sessionData.sessions.map((session, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm text-white">{session.type}</h5>
                      <Badge className="text-xs bg-teal-500/20 text-teal-400 border-teal-500/30">
                        {session.duration} min
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{session.time}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <span>Before:</span>
                          {getMoodIcon(session.mood.before)}
                          <span className="mx-1">→</span>
                          After:{getMoodIcon(session.mood.after)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Total Duration</span>
                    <span className="font-medium text-white">
                      {sessionData.sessions.reduce((acc, s) => acc + s.duration, 0)} minutes
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Monthly Summary */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xl sm:text-2xl font-bold text-white">
            {(() => {
              const filteredHistory = meditationHistory.filter(
                (h) => h.date.getMonth() === currentMonth && h.date.getFullYear() === currentYear,
              );
              return filteredHistory.length;
            })()}
          </p>
          <p className="text-xs sm:text-sm text-white/60">Days Active</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xl sm:text-2xl font-bold text-white">
            {meditationHistory
              .filter(
                (h) => h.date.getMonth() === currentMonth && h.date.getFullYear() === currentYear,
              )
              .reduce((acc, h) => acc + h.sessions.length, 0)}
          </p>
          <p className="text-xs sm:text-sm text-white/60">Total Sessions</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xl sm:text-2xl font-bold text-white">
            {meditationHistory
              .filter(
                (h) => h.date.getMonth() === currentMonth && h.date.getFullYear() === currentYear,
              )
              .reduce((acc, h) => acc + h.sessions.reduce((sum, s) => sum + s.duration, 0), 0)}
          </p>
          <p className="text-xs sm:text-sm text-white/60">Total Minutes</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xl sm:text-2xl font-bold text-white">
            {(() => {
              const sessions = meditationHistory
                .filter(
                  (h) => h.date.getMonth() === currentMonth && h.date.getFullYear() === currentYear,
                )
                .flatMap((h) => h.sessions);

              if (sessions.length === 0) return 0;

              const avgMoodIncrease =
                sessions.reduce((acc, s) => acc + (s.mood.after - s.mood.before), 0) /
                sessions.length;

              return `+${avgMoodIncrease.toFixed(1)}`;
            })()}
          </p>
          <p className="text-xs sm:text-sm text-white/60">Avg Mood ⬆️</p>
        </div>
      </div>
    </Card>
  );
};
