import React, { useState } from 'react';
import { ArrowRightLeft, Loader2, RefreshCw } from 'lucide-react';
import { convertCurrency } from '../services/geminiService';

const CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "ZAR", "MXN", "BRL"
];

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleConvert = async () => {
    setIsLoading(true);
    const convertedAmount = await convertCurrency(amount, from, to);
    setResult(convertedAmount);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-teal-600 dark:text-teal-400" /> 
          Currency Converter
        </h3>
        {lastUpdated && (
          <span className="text-xs text-slate-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-5 space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Amount</label>
             <input
               type="number"
               min="0"
               value={amount}
               onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
             />
          </div>
          <div className="col-span-7 space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">From</label>
             <select
               value={from}
               onChange={(e) => setFrom(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
             >
               {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>

        <div className="flex justify-center">
           <button 
             onClick={handleSwap}
             className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
           >
             <ArrowRightLeft className="w-4 h-4" />
           </button>
        </div>

        <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">To</label>
             <select
               value={to}
               onChange={(e) => setTo(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white"
             >
               {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
        </div>

        <button 
          onClick={handleConvert}
          disabled={isLoading}
          className="w-full mt-2 bg-teal-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md shadow-teal-500/20 hover:bg-teal-700 transition flex justify-center items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert Now'}
        </button>

        {result !== null && !isLoading && (
          <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-center border border-teal-100 dark:border-teal-800">
             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Estimated Value</p>
             <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">
               {result.toFixed(2)} <span className="text-sm font-semibold">{to}</span>
             </p>
          </div>
        )}
      </div>
    </div>
  );
};