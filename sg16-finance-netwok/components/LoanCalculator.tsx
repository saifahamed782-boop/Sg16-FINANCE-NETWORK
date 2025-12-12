import React, { useState, useEffect } from 'react';
import { LoanParams, CountryConfig } from '../types';

interface LoanCalculatorProps {
  countryConfig: CountryConfig;
  onParamsChange?: (params: LoanParams) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ countryConfig, onParamsChange }) => {
  const [params, setParams] = useState<LoanParams>({ amount: countryConfig.minLoan * 2, months: 12 });
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Reset if country changes
  useEffect(() => {
    setParams(p => ({ ...p, amount: countryConfig.minLoan * 2 }));
  }, [countryConfig]);

  useEffect(() => {
    // Simple logic: 5% flat interest PA for demo
    const interest = params.amount * 0.05 * (params.months / 12);
    const total = params.amount + interest;
    const mp = total / params.months;
    setMonthlyPayment(mp);
    if (onParamsChange) onParamsChange(params);
  }, [params, onParamsChange, countryConfig]);

  return (
    <div className="bg-tech-900/50 p-6 rounded-xl border border-tech-700 shadow-lg backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Quick Estimator</h3>
        <span className="text-xs font-mono text-gold-500 border border-gold-500/30 px-2 py-1 rounded">
          {countryConfig.currency}
        </span>
      </div>
      
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-4">
            <label className="text-sm text-gray-400">Loan Amount</label>
            <span className="text-gold-500 font-bold text-xl">
              {countryConfig.currencySymbol} {params.amount.toLocaleString()}
            </span>
          </div>
          <input 
            type="range" 
            min={countryConfig.minLoan} 
            max={countryConfig.maxLoan} 
            step={countryConfig.minLoan}
            value={params.amount}
            onChange={(e) => setParams({ ...params, amount: Number(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2 font-mono">
            <span>{countryConfig.currencySymbol} {countryConfig.minLoan.toLocaleString()}</span>
            <span>{countryConfig.currencySymbol} {countryConfig.maxLoan.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-4">
            <label className="text-sm text-gray-400">Duration</label>
            <span className="text-gold-500 font-bold text-xl">{params.months} Months</span>
          </div>
          <input 
            type="range" 
            min="6" 
            max="60" 
            step="6"
            value={params.months}
            onChange={(e) => setParams({ ...params, months: Number(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-tech-700/50">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Estimated Monthly</span>
              <span className="text-xs text-green-500">Zero Fees for Borrower</span>
            </div>
            <span className="text-4xl font-bold text-white tracking-tight">
              <span className="text-2xl align-top text-gray-500 mr-1">{countryConfig.currencySymbol}</span>
              {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};