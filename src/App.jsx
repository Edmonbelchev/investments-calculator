import { useState, useEffect } from 'react';

const EXCHANGE_RATES = {
  BGN: 1,
  USD: 0.55, // 1 BGN = 0.55 USD
  EUR: 0.51  // 1 BGN = 0.51 EUR
};

const CURRENCY_SYMBOLS = {
  BGN: 'BGN',
  USD: '$',
  EUR: '€'
};

function App() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(2500);
  const [startingBalance, setStartingBalance] = useState(0);
  const [apy, setApy] = useState(2.5);
  const [years, setYears] = useState(3);
  const [currency, setCurrency] = useState('BGN');
  const [showYearlyBreakdown, setShowYearlyBreakdown] = useState(false);
  const [results, setResults] = useState({
    totalSavings: 0,
    dailyEarnings: 0,
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    yearlyBreakdown: []
  });

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    const inBGN = amount / EXCHANGE_RATES[fromCurrency];
    return inBGN * EXCHANGE_RATES[toCurrency];
  };

  const formatAmount = (amount, curr) => {
    // Format with thousand separators and 2 decimal places
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ${CURRENCY_SYMBOLS[curr]}`;
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const calculateSavings = (months, monthlyInvestment, startingBalance, apy) => {
    const monthsPerYear = 12;
    const apyDecimal = apy / 100;
    const monthlyRate = apyDecimal / monthsPerYear;

    // If we're calculating for the first year or less, include starting balance
    if (months <= monthsPerYear) {
      let totalSavings = startingBalance;
      // Apply monthly interest and investments
      for (let month = 1; month <= months; month++) {
        totalSavings = (totalSavings + monthlyInvestment) * (1 + monthlyRate);
      }
      return totalSavings;
    } else {
      // For subsequent years, calculate without starting balance
      let firstYearSavings = calculateSavings(monthsPerYear, monthlyInvestment, startingBalance, apy);
      let remainingMonths = months - monthsPerYear;
      
      // Calculate remaining months without starting balance
      let totalSavings = firstYearSavings;
      for (let month = 1; month <= remainingMonths; month++) {
        totalSavings = (totalSavings + monthlyInvestment) * (1 + monthlyRate);
      }
      return totalSavings;
    }
  };

  const calculateDailyEarnings = (principal, apy) => {
    const daysPerYear = 365;
    return principal * ((apy / 100) / daysPerYear);
  };

  const calculateMonthlyEarnings = (principal, apy) => {
    const monthsPerYear = 12;
    return principal * ((apy / 100) / monthsPerYear);
  };

  const calculateYearlyEarnings = (principal, apy) => {
    return principal * (apy / 100);
  };

  const calculateYearlyBreakdown = (monthlyInvestmentAmount, initialBalance, totalYears, apyRate) => {
    const breakdown = [];
    const monthsPerYear = 12;
    const apyDecimal = apyRate / 100;
    const monthlyRate = apyDecimal / monthsPerYear;

    // First year calculation with initial balance
    let yearStart = initialBalance;
    let yearEnd = calculateSavings(monthsPerYear, monthlyInvestmentAmount, initialBalance, apyRate);
    let yearlyContribution = monthlyInvestmentAmount * monthsPerYear;
    let yearlyInterest = yearEnd - yearStart - yearlyContribution;

    breakdown.push({
      year: 1,
      startBalance: yearStart,
      endBalance: yearEnd,
      contribution: yearlyContribution,
      interest: yearlyInterest,
      totalReturn: (yearlyInterest / (yearStart + yearlyContribution) * 100)
    });

    // Subsequent years without initial balance
    for (let year = 2; year <= totalYears; year++) {
      yearStart = yearEnd;
      yearEnd = calculateSavings(year * monthsPerYear, monthlyInvestmentAmount, initialBalance, apyRate);
      yearlyContribution = monthlyInvestmentAmount * monthsPerYear;
      yearlyInterest = yearEnd - yearStart - yearlyContribution;

      breakdown.push({
        year,
        startBalance: yearStart,
        endBalance: yearEnd,
        contribution: yearlyContribution,
        interest: yearlyInterest,
        totalReturn: (yearlyInterest / (yearStart + yearlyContribution) * 100)
      });
    }

    return breakdown;
  };

  useEffect(() => {
    // Convert amounts to BGN for calculations
    const monthlyInvestmentBGN = convertCurrency(monthlyInvestment, currency, 'BGN');
    const startingBalanceBGN = convertCurrency(startingBalance, currency, 'BGN');
    const totalSavings = calculateSavings(years * 12, monthlyInvestmentBGN, startingBalanceBGN, apy);
    const dailyEarnings = calculateDailyEarnings(totalSavings, apy);
    const monthlyEarnings = calculateMonthlyEarnings(totalSavings, apy);
    const yearlyEarnings = calculateYearlyEarnings(totalSavings, apy);
    
    // Calculate yearly breakdown
    const breakdown = calculateYearlyBreakdown(monthlyInvestmentBGN, startingBalanceBGN, years, apy)
      .map(year => ({
        ...year,
        startBalance: convertCurrency(year.startBalance, 'BGN', currency),
        endBalance: convertCurrency(year.endBalance, 'BGN', currency),
        contribution: convertCurrency(year.contribution, 'BGN', currency),
        interest: convertCurrency(year.interest, 'BGN', currency)
      }));

    // Convert results back to selected currency
    setResults({
      totalSavings: convertCurrency(totalSavings, 'BGN', currency),
      dailyEarnings: convertCurrency(dailyEarnings, 'BGN', currency),
      monthlyEarnings: convertCurrency(monthlyEarnings, 'BGN', currency),
      yearlyEarnings: convertCurrency(yearlyEarnings, 'BGN', currency),
      yearlyBreakdown: breakdown
    });
  }, [monthlyInvestment, startingBalance, apy, years, currency]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Investment Calculator
          </h1>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Starting Balance
                </label>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Investment
                </label>
                <input
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="BGN">BGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Annual Percentage Yield (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={apy}
                onChange={(e) => setApy(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Investment Period (Years)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8 w-full">
              <h2 className="text-xl font-semibold text-gray-900 p-6 bg-gray-50 border-b border-gray-200">Results</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Savings
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest Earnings
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Daily</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(results.totalSavings, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(results.dailyEarnings, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {formatPercent(results.dailyEarnings / results.totalSavings * 100)}%
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Monthly</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(results.totalSavings, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(results.monthlyEarnings, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {formatPercent(results.monthlyEarnings / results.totalSavings * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Yearly</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(results.totalSavings, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatAmount(results.yearlyEarnings, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {formatPercent(results.yearlyEarnings / results.totalSavings * 100)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Based on {formatAmount(monthlyInvestment, currency)} monthly investment over {years} years at {apy}% APY
                  </p>
                  <button
                    onClick={() => setShowYearlyBreakdown(!showYearlyBreakdown)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {showYearlyBreakdown ? 'Hide' : 'Show'} Yearly Breakdown
                  </button>
                </div>
              </div>

              {showYearlyBreakdown && (
                <div className="border-t border-gray-200 overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Starting Balance
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Yearly Contribution
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interest Earned
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ending Balance
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Return Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.yearlyBreakdown.map((yearData, index) => (
                        <tr key={yearData.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Year {yearData.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatAmount(yearData.startBalance, currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatAmount(yearData.contribution, currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatAmount(yearData.interest, currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatAmount(yearData.endBalance, currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            {formatPercent(yearData.totalReturn)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
