import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Expense } from '../types';
import { categorizeExpense } from '../services/geminiService';
import { DollarSign, TrendingUp, AlertCircle, Plus, Trash2, Wallet, Wand2, Loader2, Tag, Pencil, Check, Lock, Download } from 'lucide-react';
import { CurrencyConverter } from './CurrencyConverter';

const COLORS = ['#0d9488', '#0891b2', '#059669', '#ca8a04', '#db2777', '#4f46e5'];

const CATEGORY_MAP: Record<string, string[]> = {
  Food: ['Restaurants', 'Groceries', 'Snacks', 'Drinks'],
  Transport: ['Flight', 'Taxi', 'Train', 'Bus', 'Fuel', 'Rental'],
  Accommodation: ['Hotel', 'Hostel', 'Airbnb', 'Resort', 'Fees'],
  Activities: ['Tickets', 'Tours', 'Equipment', 'Entertainment'],
  Shopping: ['Clothes', 'Souvenirs', 'Electronics', 'Duty Free'],
  Other: ['General', 'Sim Card', 'Insurance', 'Visa']
};

const DEFAULT_EXPENSES: Expense[] = [];

export const ExpenseDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('musafirx_expenses');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [budget, setBudget] = useState<number>(() => {
    const saved = localStorage.getItem('musafirx_budget');
    return saved ? parseFloat(saved) : 0;
  });

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Food',
    subcategory: 'Restaurants',
    amount: '',
    description: ''
  });

  const [isAutoTagging, setIsAutoTagging] = useState(false);

  useEffect(() => {
    localStorage.setItem('musafirx_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('musafirx_budget', budget.toString());
  }, [budget]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      subcategory: newExpense.subcategory,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0]
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ category: 'Food', subcategory: 'Restaurants', amount: '', description: '' });
  };

  const handleAutoCategorize = async () => {
    if (!newExpense.description) return;
    setIsAutoTagging(true);
    const result = await categorizeExpense(newExpense.description, parseFloat(newExpense.amount) || 0);
    
    // Validate if the result category exists in our map, otherwise fallback
    let cat = result.category;
    let sub = result.subcategory;
    
    if (!CATEGORY_MAP[cat]) {
      cat = 'Other';
      sub = 'General';
    } else if (!CATEGORY_MAP[cat].includes(sub)) {
      sub = CATEGORY_MAP[cat][0];
    }

    setNewExpense(prev => ({ ...prev, category: cat, subcategory: sub }));
    setIsAutoTagging(false);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    
    const headers = ['Date', 'Category', 'Subcategory', 'Description', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => {
        const row = [
          expense.date,
          expense.category,
          expense.subcategory || '',
          `"${expense.description.replace(/"/g, '""')}"`, // Handle commas/quotes in description
          expense.amount
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `musafirx_expenses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = budget - totalSpent;
  const progress = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const isBudgetSet = budget > 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-2">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Trip Budget</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your spending and stay on target.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="w-24 h-24 text-teal-600 dark:text-teal-400 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center justify-between">
                    Total Budget
                    {isBudgetSet && !isEditingBudget && (
                      <button onClick={() => setIsEditingBudget(true)} className="text-slate-400 hover:text-teal-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </p>
                  
                  {isEditingBudget || !isBudgetSet ? (
                     <div className="flex flex-col mt-2">
                        {!isBudgetSet && !isEditingBudget ? (
                            <button 
                              onClick={() => setIsEditingBudget(true)}
                              className="text-left text-2xl font-extrabold text-slate-300 dark:text-slate-600 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                            >
                              Set Budget
                            </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₹</span>
                            <input 
                              type="number"
                              autoFocus
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                              value={budget || ''}
                              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                              onBlur={() => { if(budget > 0) setIsEditingBudget(false); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && budget > 0) setIsEditingBudget(false);
                              }}
                              placeholder="0"
                            />
                            <button 
                                onClick={() => setIsEditingBudget(false)} 
                                disabled={budget <= 0}
                                className="bg-teal-600 text-white p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                     </div>
                  ) : (
                    <div className="flex items-baseline gap-1 mt-2 cursor-pointer" onClick={() => setIsEditingBudget(true)}>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{budget.toLocaleString()}</span>
                    </div>
                  )}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 relative overflow-hidden transition-shadow ${!isBudgetSet ? 'opacity-80' : 'group hover:shadow-md'}`}>
                {!isBudgetSet && (
                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[2px]">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2">
                        <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Locked</span>
                   </div>
                )}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-24 h-24 text-rose-600 transform rotate-12 translate-x-4 -translate-y-4" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Spent</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{totalSpent.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                    <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 relative overflow-hidden transition-shadow ${!isBudgetSet ? 'opacity-80' : 'group hover:shadow-md'}`}>
                {!isBudgetSet && (
                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[2px]">
                       <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm mb-2">
                         <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                       </div>
                       <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Locked</span>
                   </div>
                )}
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle className={`w-24 h-24 transform rotate-12 translate-x-4 -translate-y-4 ${remaining > 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Remaining</p>
                   <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-extrabold ${remaining > 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{remaining.toLocaleString()}</span>
                  </div>
               </div>
               <div className="mt-4 text-xs font-medium text-slate-400">
                    {remaining > 0 ? 'You are within budget' : 'Over budget warning'}
               </div>
            </div>
          </div>

          {/* Add Expense Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-1.5 rounded-lg text-teal-600 dark:text-teal-400">
                    <Plus className="w-4 h-4" /> 
                </div>
                Add New Expense
            </h3>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                 <div className="md:col-span-4 space-y-3">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Description</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="e.g. Sushi Dinner at Ginza"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all pr-10"
                                value={newExpense.description}
                                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                                onBlur={handleAutoCategorize} // Trigger AI categorization when leaving field
                            />
                            <button 
                                type="button"
                                onClick={handleAutoCategorize}
                                disabled={!newExpense.description || isAutoTagging}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                title="Auto-categorize with AI"
                            >
                                {isAutoTagging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Category</label>
                    <select 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all"
                        value={newExpense.category}
                        onChange={e => {
                            const cat = e.target.value;
                            setNewExpense({...newExpense, category: cat, subcategory: CATEGORY_MAP[cat]?.[0] || 'General'});
                        }}
                    >
                        {Object.keys(CATEGORY_MAP).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Subcategory</label>
                    <select 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all"
                        value={newExpense.subcategory}
                        onChange={e => setNewExpense({...newExpense, subcategory: e.target.value})}
                    >
                        {CATEGORY_MAP[newExpense.category]?.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Amount</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">₹</div>
                        <input 
                            type="number" 
                            placeholder="0.00"
                            className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 dark:bg-slate-900 dark:text-white transition-all"
                            value={newExpense.amount}
                            onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                        />
                    </div>
                 </div>
                 
                 <div className="md:col-span-2">
                    <button 
                        type="submit"
                        className="w-full bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 font-semibold shadow-lg shadow-teal-200 dark:shadow-teal-900/50 hover:shadow-teal-300 transition-all"
                    >
                        Add
                    </button>
                 </div>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-1">
           <CurrencyConverter />
        </div>
      </div>

      {/* Charts */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wide">Spend Breakdown</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                    <Pie
                        data={expenses as any[]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                        stroke="none"
                    >
                        {expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value) => `₹${value}`} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-sm uppercase tracking-wide">Category Analysis</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                    data={expenses as any[]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="category" tick={{fontSize: 12, fill: '#64748b'}} interval={0} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} axisLine={false} tickLine={false} />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}} 
                        formatter={(value) => `₹${value}`} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400">
            <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6 text-slate-300 dark:text-slate-500" />
            </div>
            <p className="font-medium">No expenses recorded yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Add your first expense to see analytics</p>
        </div>
      )}

      {/* Expense List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <button 
                onClick={handleExportCSV}
                disabled={expenses.length === 0}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download className="w-4 h-4" /> Export CSV
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-700">
                <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Subcategory</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{expense.date}</td>
                    <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-600">
                        {expense.category}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                         <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Tag className="w-3 h-3" /> {expense.subcategory || 'General'}
                         </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{expense.description}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">₹{expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                        <button 
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};