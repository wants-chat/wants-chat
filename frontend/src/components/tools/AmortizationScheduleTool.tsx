import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, Calendar, TrendingDown, Download, Info, Sparkles, Table } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

interface YearlySummary {
  year: number;
  payments: number;
  principal: number;
  interest: number;
  endBalance: number;
}

interface AmortizationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
  yearlySummary: YearlySummary[];
}

interface AmortizationScheduleToolProps {
  uiConfig?: UIConfig;
}

export const AmortizationScheduleTool: React.FC<AmortizationScheduleToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loanAmount, setLoanAmount] = useState('300000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [extraPayment, setExtraPayment] = useState('0');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setLoanAmount(String(params.amount));
        setIsPrefilled(true);
      }
      if (params.interestRate !== undefined) {
        setInterestRate(String(params.interestRate));
        setIsPrefilled(true);
      }
      if (params.loanTerm !== undefined) {
        setLoanTermYears(String(params.loanTerm));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const result = useMemo<AmortizationResult | null>(() => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTermYears) || 30;
    const extra = parseFloat(extraPayment) || 0;

    if (principal <= 0 || rate <= 0 || years <= 0) {
      return null;
    }

    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    // Calculate base monthly payment
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPaymentWithExtra = monthlyPayment + extra;

    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    let month = 1;

    while (balance > 0.01 && month <= numPayments) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = Math.min(balance, monthlyPayment - interestPayment + extra);
      const payment = interestPayment + principalPayment;

      // Handle final payment
      if (balance - principalPayment < 0.01) {
        principalPayment = balance;
      }

      balance -= principalPayment;
      if (balance < 0) balance = 0;

      cumulativePrincipal += principalPayment;
      cumulativeInterest += interestPayment;

      schedule.push({
        month,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
        cumulativePrincipal,
        cumulativeInterest,
      });

      month++;
    }

    // Generate yearly summary
    const yearlySummary: YearlySummary[] = [];
    const totalMonths = schedule.length;
    const totalYears = Math.ceil(totalMonths / 12);

    for (let year = 1; year <= totalYears; year++) {
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, totalMonths);
      const yearEntries = schedule.slice(startMonth, endMonth);

      if (yearEntries.length > 0) {
        yearlySummary.push({
          year,
          payments: yearEntries.reduce((sum, e) => sum + e.payment, 0),
          principal: yearEntries.reduce((sum, e) => sum + e.principal, 0),
          interest: yearEntries.reduce((sum, e) => sum + e.interest, 0),
          endBalance: yearEntries[yearEntries.length - 1].balance,
        });
      }
    }

    const totalInterest = schedule.reduce((sum, e) => sum + e.interest, 0);
    const totalPayment = schedule.reduce((sum, e) => sum + e.payment, 0);

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
      yearlySummary,
    };
  }, [loanAmount, interestRate, loanTermYears, extraPayment]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const exportCSV = () => {
    if (!result) return;

    const headers = ['Month', 'Payment', 'Principal', 'Interest', 'Balance'];
    const rows = result.schedule.map((row) => [
      row.month,
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.balance.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization-schedule.csv';
    a.click();
  };

  const getPayoffDate = () => {
    if (!result || !startDate) return '';
    const [year, month] = startDate.split('-').map(Number);
    const payoffMonth = result.schedule.length;
    const totalMonths = (year * 12 + month - 1) + payoffMonth;
    const payoffYear = Math.floor(totalMonths / 12);
    const payoffMonthNum = totalMonths % 12 || 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[payoffMonthNum - 1]} ${payoffYear}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-purple-900/20' : 'bg-gradient-to-r from-white to-purple-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Table className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.amortizationSchedule.amortizationSchedule', 'Amortization Schedule')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.amortizationSchedule.viewYourCompleteLoanPayment', 'View your complete loan payment schedule')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.amortizationSchedule.valuesLoadedFromYourConversation', 'Values loaded from your conversation')}</span>
          </div>
        )}

        {/* Loan Amount */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('tools.amortizationSchedule.loanAmount', 'Loan Amount')}
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="300000"
              className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </div>

        {/* Interest Rate & Term */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.amortizationSchedule.interestRate', 'Interest Rate (%)')}
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              step="0.125"
              placeholder="7.0"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('tools.amortizationSchedule.loanTermYears', 'Loan Term (years)')}
            </label>
            <select
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="10">10 years</option>
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="25">25 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>

        {/* Start Date & Extra Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.amortizationSchedule.startDate', 'Start Date')}
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <TrendingDown className="w-4 h-4 inline mr-1" />
              {t('tools.amortizationSchedule.extraMonthlyPayment', 'Extra Monthly Payment')}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="0"
                className={`w-full pl-8 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.amortizationSchedule.monthlyPayment', 'Monthly Payment')}</div>
                  <div className="text-2xl font-bold text-purple-500">
                    {formatCurrency(result.monthlyPayment + parseFloat(extraPayment || '0'))}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.amortizationSchedule.totalInterest', 'Total Interest')}</div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(result.totalInterest)}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.amortizationSchedule.totalPayments', 'Total Payments')}</div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(result.totalPayment)}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('tools.amortizationSchedule.payoffDate', 'Payoff Date')}</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {getPayoffDate()}
                  </div>
                </div>
              </div>
              {parseFloat(extraPayment) > 0 && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-purple-800' : 'border-purple-200'} text-center`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    With ${extraPayment}/mo extra: Save {formatCurrency((parseFloat(loanTermYears) * 12 - result.schedule.length) * result.monthlyPayment)} in interest!
                    Payoff {(parseFloat(loanTermYears) * 12 - result.schedule.length)} months early.
                  </span>
                </div>
              )}
            </div>

            {/* View Toggle & Export */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('yearly')}
                  className={`py-2 px-4 rounded-lg font-medium ${
                    viewMode === 'yearly'
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.amortizationSchedule.yearly', 'Yearly')}
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`py-2 px-4 rounded-lg font-medium ${
                    viewMode === 'monthly'
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('tools.amortizationSchedule.monthly', 'Monthly')}
                </button>
              </div>
              <button
                onClick={exportCSV}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium ${
                  isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Download className="w-4 h-4" />
                {t('tools.amortizationSchedule.exportCsv', 'Export CSV')}
              </button>
            </div>

            {/* Schedule Table */}
            <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} overflow-hidden`}>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className={`sticky top-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <tr>
                      <th className={`py-3 px-4 text-left ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {viewMode === 'yearly' ? t('tools.amortizationSchedule.year', 'Year') : t('tools.amortizationSchedule.month', 'Month')}
                      </th>
                      <th className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.amortizationSchedule.payment', 'Payment')}</th>
                      <th className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.amortizationSchedule.principal', 'Principal')}</th>
                      <th className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.amortizationSchedule.interest', 'Interest')}</th>
                      <th className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.amortizationSchedule.balance', 'Balance')}</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? 'divide-gray-700' : 'divide-gray-200'}>
                    {viewMode === 'yearly' ? (
                      result.yearlySummary.map((row) => (
                        <tr key={row.year} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Year {row.year}
                          </td>
                          <td className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatCurrency(row.payments)}
                          </td>
                          <td className="py-3 px-4 text-right text-green-500">
                            {formatCurrency(row.principal)}
                          </td>
                          <td className="py-3 px-4 text-right text-red-500">
                            {formatCurrency(row.interest)}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(row.endBalance)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      result.schedule.slice(0, 120).map((row) => (
                        <tr
                          key={row.month}
                          className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                            row.month % 12 === 0 ? (isDark ? 'bg-gray-700/50' : 'bg-gray-100') : ''
                          }`}
                        >
                          <td className={`py-2 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {row.month}
                          </td>
                          <td className={`py-2 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatCurrency(row.payment)}
                          </td>
                          <td className="py-2 px-4 text-right text-green-500">
                            {formatCurrency(row.principal)}
                          </td>
                          <td className="py-2 px-4 text-right text-red-500">
                            {formatCurrency(row.interest)}
                          </td>
                          <td className={`py-2 px-4 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(row.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {viewMode === 'monthly' && result.schedule.length > 120 && (
                  <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.amortizationSchedule.showingFirst120MonthsExport', 'Showing first 120 months. Export CSV for complete schedule.')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.amortizationSchedule.tip', 'Tip:')}</strong> Adding extra monthly payments can significantly reduce total interest and payoff time. Even small extra payments can save thousands over the life of the loan.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationScheduleTool;
