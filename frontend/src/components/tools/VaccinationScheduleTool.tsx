import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Calendar, Check, Clock, AlertTriangle, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface VaccinationScheduleToolProps {
  uiConfig?: UIConfig;
}

interface Vaccine {
  id: string;
  name: string;
  fullName: string;
  doses: { ageMonths: number; ageLabel: string }[];
  description: string;
  protectsAgainst: string[];
}

interface VaccineStatus {
  vaccine: Vaccine;
  dose: number;
  dueDate: Date;
  status: 'completed' | 'due' | 'upcoming' | 'overdue';
  ageLabel: string;
}

const vaccines: Vaccine[] = [
  {
    id: 'hepb',
    name: 'Hepatitis B',
    fullName: 'Hepatitis B (HepB)',
    doses: [
      { ageMonths: 0, ageLabel: 'Birth' },
      { ageMonths: 1, ageLabel: '1-2 months' },
      { ageMonths: 6, ageLabel: '6-18 months' },
    ],
    description: 'Protects against hepatitis B, a serious liver infection',
    protectsAgainst: ['Hepatitis B virus', 'Liver disease', 'Liver cancer'],
  },
  {
    id: 'rv',
    name: 'Rotavirus',
    fullName: 'Rotavirus (RV)',
    doses: [
      { ageMonths: 2, ageLabel: '2 months' },
      { ageMonths: 4, ageLabel: '4 months' },
      { ageMonths: 6, ageLabel: '6 months' },
    ],
    description: 'Prevents severe diarrhea and vomiting in infants',
    protectsAgainst: ['Rotavirus', 'Severe diarrhea', 'Dehydration'],
  },
  {
    id: 'dtap',
    name: 'DTaP',
    fullName: 'Diphtheria, Tetanus, Pertussis (DTaP)',
    doses: [
      { ageMonths: 2, ageLabel: '2 months' },
      { ageMonths: 4, ageLabel: '4 months' },
      { ageMonths: 6, ageLabel: '6 months' },
      { ageMonths: 15, ageLabel: '15-18 months' },
      { ageMonths: 48, ageLabel: '4-6 years' },
    ],
    description: 'Protects against three serious diseases',
    protectsAgainst: ['Diphtheria', 'Tetanus (lockjaw)', 'Pertussis (whooping cough)'],
  },
  {
    id: 'hib',
    name: 'Hib',
    fullName: 'Haemophilus influenzae type b (Hib)',
    doses: [
      { ageMonths: 2, ageLabel: '2 months' },
      { ageMonths: 4, ageLabel: '4 months' },
      { ageMonths: 6, ageLabel: '6 months' },
      { ageMonths: 12, ageLabel: '12-15 months' },
    ],
    description: 'Prevents Hib disease which can cause meningitis',
    protectsAgainst: ['Meningitis', 'Pneumonia', 'Epiglottitis'],
  },
  {
    id: 'pcv',
    name: 'PCV15/20',
    fullName: 'Pneumococcal Conjugate (PCV15 or PCV20)',
    doses: [
      { ageMonths: 2, ageLabel: '2 months' },
      { ageMonths: 4, ageLabel: '4 months' },
      { ageMonths: 6, ageLabel: '6 months' },
      { ageMonths: 12, ageLabel: '12-15 months' },
    ],
    description: 'Protects against pneumococcal disease',
    protectsAgainst: ['Pneumonia', 'Meningitis', 'Blood infections'],
  },
  {
    id: 'ipv',
    name: 'Polio',
    fullName: 'Inactivated Poliovirus (IPV)',
    doses: [
      { ageMonths: 2, ageLabel: '2 months' },
      { ageMonths: 4, ageLabel: '4 months' },
      { ageMonths: 6, ageLabel: '6-18 months' },
      { ageMonths: 48, ageLabel: '4-6 years' },
    ],
    description: 'Prevents polio, which can cause paralysis',
    protectsAgainst: ['Poliovirus', 'Paralysis', 'Death'],
  },
  {
    id: 'mmr',
    name: 'MMR',
    fullName: 'Measles, Mumps, Rubella (MMR)',
    doses: [
      { ageMonths: 12, ageLabel: '12-15 months' },
      { ageMonths: 48, ageLabel: '4-6 years' },
    ],
    description: 'Protects against three viral diseases',
    protectsAgainst: ['Measles', 'Mumps', 'Rubella (German measles)'],
  },
  {
    id: 'var',
    name: 'Varicella',
    fullName: 'Varicella (Chickenpox)',
    doses: [
      { ageMonths: 12, ageLabel: '12-15 months' },
      { ageMonths: 48, ageLabel: '4-6 years' },
    ],
    description: 'Prevents chickenpox',
    protectsAgainst: ['Chickenpox', 'Shingles later in life'],
  },
  {
    id: 'hepa',
    name: 'Hepatitis A',
    fullName: 'Hepatitis A (HepA)',
    doses: [
      { ageMonths: 12, ageLabel: '12-23 months' },
      { ageMonths: 18, ageLabel: '6 months after 1st dose' },
    ],
    description: 'Protects against hepatitis A liver infection',
    protectsAgainst: ['Hepatitis A virus', 'Liver disease'],
  },
  {
    id: 'flu',
    name: 'Influenza',
    fullName: 'Influenza (Flu)',
    doses: [
      { ageMonths: 6, ageLabel: '6 months (annual)' },
    ],
    description: 'Annual vaccine recommended for everyone 6 months and older',
    protectsAgainst: ['Seasonal influenza', 'Flu complications'],
  },
];

export const VaccinationScheduleTool: React.FC<VaccinationScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [birthDate, setBirthDate] = useState('');
  const [completedVaccines, setCompletedVaccines] = useState<Set<string>>(new Set());
  const [expandedVaccine, setExpandedVaccine] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.content) {
        const dateMatch = params.content.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          setBirthDate(dateMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  const schedule = useMemo((): VaccineStatus[] => {
    if (!birthDate) return [];

    const birth = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statuses: VaccineStatus[] = [];

    vaccines.forEach((vaccine) => {
      vaccine.doses.forEach((dose, index) => {
        const dueDate = new Date(birth);
        dueDate.setMonth(birth.getMonth() + dose.ageMonths);

        const vaccineKey = `${vaccine.id}-${index + 1}`;
        const isCompleted = completedVaccines.has(vaccineKey);

        let status: VaccineStatus['status'];
        if (isCompleted) {
          status = 'completed';
        } else if (dueDate < today) {
          const monthsOverdue = (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          status = monthsOverdue > 1 ? 'overdue' : 'due';
        } else {
          const monthsUntil = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
          status = monthsUntil <= 1 ? 'due' : 'upcoming';
        }

        statuses.push({
          vaccine,
          dose: index + 1,
          dueDate,
          status,
          ageLabel: dose.ageLabel,
        });
      });
    });

    return statuses.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [birthDate, completedVaccines]);

  const toggleCompleted = (vaccineId: string, doseNum: number) => {
    const key = `${vaccineId}-${doseNum}`;
    setCompletedVaccines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getStatusColor = (status: VaccineStatus['status']) => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-100 border-green-300 text-green-700';
      case 'overdue':
        return isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-300 text-red-700';
      case 'due':
        return isDark ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' : 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default:
        return isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = (status: VaccineStatus['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'due':
        return <Clock className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const stats = useMemo(() => {
    const completed = schedule.filter((s) => s.status === 'completed').length;
    const overdue = schedule.filter((s) => s.status === 'overdue').length;
    const due = schedule.filter((s) => s.status === 'due').length;
    const upcoming = schedule.filter((s) => s.status === 'upcoming').length;
    return { completed, overdue, due, upcoming, total: schedule.length };
  }, [schedule]);

  const groupedByStatus = useMemo(() => {
    return {
      overdue: schedule.filter((s) => s.status === 'overdue'),
      due: schedule.filter((s) => s.status === 'due'),
      upcoming: schedule.filter((s) => s.status === 'upcoming').slice(0, 5),
      completed: schedule.filter((s) => s.status === 'completed'),
    };
  }, [schedule]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <Shield className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.vaccinationSchedule.vaccinationScheduleTracker', 'Vaccination Schedule Tracker')}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('tools.vaccinationSchedule.trackYourChildSImmunization', 'Track your child\'s immunization schedule')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Prefill indicator */}
            {isPrefilled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
                <Sparkles className="w-4 h-4 text-[#0D9488]" />
                <span className="text-sm text-[#0D9488] font-medium">
                  {t('tools.vaccinationSchedule.dateLoadedFromYourConversation', 'Date loaded from your conversation')}
                </span>
              </div>
            )}

            {/* Birth Date Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('tools.vaccinationSchedule.childSBirthDate', 'Child\'s Birth Date')}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {schedule.length > 0 && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className="text-xl font-bold text-green-500">{stats.completed}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationSchedule.completed', 'Completed')}</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="text-xl font-bold text-red-500">{stats.overdue}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationSchedule.overdue', 'Overdue')}</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                    <div className="text-xl font-bold text-yellow-500">{stats.due}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationSchedule.dueNow', 'Due Now')}</div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stats.upcoming}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.vaccinationSchedule.upcoming', 'Upcoming')}</div>
                  </div>
                </div>

                {/* Overdue Vaccines */}
                {groupedByStatus.overdue.length > 0 && (
                  <div className={`p-4 rounded-lg border-l-4 border-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        Overdue Vaccinations ({groupedByStatus.overdue.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedByStatus.overdue.map((item, idx) => (
                        <div
                          key={`overdue-${idx}`}
                          className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                          <div>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.vaccine.name} (Dose {item.dose})
                            </span>
                            <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Due: {formatDate(item.dueDate)}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleCompleted(item.vaccine.id, item.dose)}
                            className="px-3 py-1 text-sm rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] transition-colors"
                          >
                            {t('tools.vaccinationSchedule.markDone', 'Mark Done')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Due Now */}
                {groupedByStatus.due.length > 0 && (
                  <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Due Now ({groupedByStatus.due.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedByStatus.due.map((item, idx) => (
                        <div
                          key={`due-${idx}`}
                          className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                          <div>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.vaccine.name} (Dose {item.dose})
                            </span>
                            <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.ageLabel}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleCompleted(item.vaccine.id, item.dose)}
                            className="px-3 py-1 text-sm rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E] transition-colors"
                          >
                            {t('tools.vaccinationSchedule.markDone2', 'Mark Done')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                {groupedByStatus.upcoming.length > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-[#0D9488]" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.vaccinationSchedule.upcomingVaccinations', 'Upcoming Vaccinations')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedByStatus.upcoming.map((item, idx) => (
                        <div
                          key={`upcoming-${idx}`}
                          className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                          <div>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.vaccine.name} (Dose {item.dose})
                            </span>
                            <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(item.dueDate)}
                            </span>
                          </div>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.ageLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vaccine Details */}
                <div className="space-y-2">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.vaccinationSchedule.vaccineInformation', 'Vaccine Information')}
                  </h4>
                  {vaccines.map((vaccine) => (
                    <div
                      key={vaccine.id}
                      className={`rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                    >
                      <button
                        onClick={() => setExpandedVaccine(expandedVaccine === vaccine.id ? null : vaccine.id)}
                        className={`w-full flex items-center justify-between p-3 text-left`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#0D9488]" />
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {vaccine.name}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            ({vaccine.doses.length} doses)
                          </span>
                        </div>
                        {expandedVaccine === vaccine.id ? (
                          <ChevronUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                      {expandedVaccine === vaccine.id && (
                        <div className={`p-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>{t('tools.vaccinationSchedule.fullName', 'Full Name:')}</strong> {vaccine.fullName}
                          </p>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {vaccine.description}
                          </p>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>{t('tools.vaccinationSchedule.protectsAgainst', 'Protects Against:')}</strong>
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {vaccine.protectsAgainst.map((item, idx) => (
                              <li key={idx} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {item}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {t('tools.vaccinationSchedule.doseSchedule', 'Dose Schedule:')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {vaccine.doses.map((dose, idx) => {
                                const key = `${vaccine.id}-${idx + 1}`;
                                const isCompleted = completedVaccines.has(key);
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => toggleCompleted(vaccine.id, idx + 1)}
                                    className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 transition-colors ${
                                      isCompleted
                                        ? 'bg-green-500 text-white border-green-500'
                                        : isDark
                                        ? 'bg-gray-600 text-gray-300 border-gray-500 hover:bg-gray-500'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    {isCompleted && <Check className="w-3 h-3" />}
                                    Dose {idx + 1}: {dose.ageLabel}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Info Note */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.vaccinationSchedule.thisScheduleIsBasedOn', 'This schedule is based on CDC recommendations for children in the United States. Always consult your pediatrician for personalized vaccination advice. Some vaccines may have different schedules or catch-up options.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationScheduleTool;
