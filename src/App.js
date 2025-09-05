import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Banknote, Zap, Clock, Target, Calculator } from 'lucide-react';

// --- Helper Functions ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value);
const formatPercent = (value) => `${value.toFixed(1)}%`;

const colorShades = {
  'blue-200': 'blue-700',
  'green-200': 'green-700',
  'purple-200': 'purple-700',
  'orange-200': 'orange-700',
};
const borderColorShades = {
  'blue-200': 'blue-300',
  'green-200': 'green-300',
  'purple-200': 'purple-300',
  'orange-200': 'orange-300',
};
const ringColorShades = {
  'blue-200': 'blue-500',
  'green-200': 'green-500',
  'purple-200': 'purple-500',
  'orange-200': 'orange-500',
};

const calculateCompoundData = ({
  initialAmount,
  monthlyAmount,
  interestRate,
  years,
}) => {
  const numYears = Number(years) || 0;
  const numMonthlyAmount = Number(monthlyAmount) || 0;
  const numInterestRate = Number(interestRate) || 0;
  const numInitialAmount = Number(initialAmount) || 0;

  if (numYears <= 0 || numInterestRate < 0 || numMonthlyAmount < 0 || numInitialAmount < 0) return [];

  const monthlyRate = numInterestRate / 100 / 12;
  const annualRate = numInterestRate / 100;
  const result = [];
  let compoundBalance = numInitialAmount;

  for (let year = 1; year <= numYears; year++) {
    for (let month = 1; month <= 12; month++) {
      compoundBalance += numMonthlyAmount;
      compoundBalance *= (1 + monthlyRate);
    }
    const totalContributions = numInitialAmount + (numMonthlyAmount * 12 * year);
    const compoundInterestEarned = compoundBalance - totalContributions;

    // Correct Simple Interest Calculation
    const simpleInterestEarned = (numInitialAmount * annualRate * year) + (numMonthlyAmount * annualRate * year);
    const simpleBalance = numInitialAmount + (numMonthlyAmount * 12 * year) + simpleInterestEarned;
    
    result.push({
      year,
      balance: Math.round(compoundBalance),
      totalContributions: Math.round(totalContributions),
      interestEarned: Math.round(compoundInterestEarned),
      simpleBalance: Math.round(simpleBalance),
    });
  }
  return result;
};

// --- React Component ---
const App = () => {
  const [inputs, setInputs] = useState([
    { id: 'initialAmount', label: 'Initial Amount', value: '', icon: <Banknote size={20} />, color: 'blue-200', placeholder: '0' },
    { id: 'monthlyAmount', label: 'Monthly Savings', value: '100', icon: <Target size={20} />, color: 'green-200', placeholder: '100' },
    { id: 'interestRate', label: 'Annual Return (%)', value: '7', icon: <Calculator size={20} />, color: 'purple-200', placeholder: '7' },
    { id: 'years', label: 'Time (Years)', value: '40', icon: <Clock size={20} />, color: 'orange-200', placeholder: '40' },
  ]);

  const { initialAmount, monthlyAmount, interestRate, years } = useMemo(() => {
    return {
      initialAmount: inputs.find(i => i.id === 'initialAmount')?.value || '0',
      monthlyAmount: inputs.find(i => i.id === 'monthlyAmount')?.value || '0',
      interestRate: inputs.find(i => i.id === 'interestRate')?.value || '0',
      years: inputs.find(i => i.id === 'years')?.value || '0',
    };
  }, [inputs]);

  const data = useMemo(() => {
    return calculateCompoundData({
      initialAmount,
      monthlyAmount,
      interestRate,
      years,
    });
  }, [initialAmount, monthlyAmount, interestRate, years]);

  const finalData = data.length > 0 ? data[data.length - 1] : null;

  const interestMultiplier = finalData && finalData.totalContributions > 0 ? finalData.interestEarned / finalData.totalContributions : 0;
  const effectiveRate = finalData && finalData.totalContributions > 0 ? (Math.pow(finalData.balance / finalData.totalContributions, 1 / Number(years)) - 1) * 100 : 0;

  const calculateExample = (monthly, years) => {
    const rate = Number(interestRate) / 100 / 12;
    let balance = 0;
    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        balance += monthly;
        balance *= (1 + rate);
      }
    }
    return Math.round(balance);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
          <Zap className="text-yellow-500 animate-pulse" /> The Magic of Compound Interest <TrendingUp className="text-green-500" />
        </h1>
        <p className="text-2xl text-gray-700 font-medium">Einstein called it the 8th wonder of the world!</p>
      </div>

      <DragDropContext onDragEnd={(result) => {
        if (!result.destination) return;
        const newInputs = Array.from(inputs);
        const [movedItem] = newInputs.splice(result.source.index, 1);
        newInputs.splice(result.destination.index, 0, movedItem);
        setInputs(newInputs);
      }}>
        <Droppable droppableId="inputs">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {inputs.map((input, index) => (
                <Draggable key={input.id} draggableId={input.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white p-6 rounded-2xl shadow-lg border border-${input.color} hover:shadow-xl transition-shadow`}
                    >
                      <label className={`block text-lg font-bold text-${colorShades[input.color]} mb-3 flex items-center gap-2`}>
                        {input.icon} {input.label}
                      </label>
                      <input
                        type="text"
                        value={input.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (input.id === 'interestRate' ? /^\d*\.?\d*$/.test(value) : /^\d+$/.test(value)) && Number(value) >= 0) {
                            setInputs(inputs.map(i => i.id === input.id ? { ...i, value } : i));
                          }
                        }}
                        className={`w-full p-3 text-xl border-2 border-${borderColorShades[input.color]} rounded-lg focus:ring-2 focus:ring-${ringColorShades[input.color]} focus:border-transparent`}
                        placeholder={input.placeholder}
                      />
                      <p className={`text-sm text-${colorShades[input.color]} mt-2`}>
                        {input.label.includes('Return') ? 'S&P 500 avg: ~10%' : input.label.includes('Time') ? 'Time is your superpower!' : 'Starting lump sum'}
                      </p>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {finalData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl text-center shadow-lg border-l-4 border-gray-400">
            <Banknote className="mx-auto text-gray-600 mb-3" size={36} />
            <p className="text-lg font-semibold text-gray-600">You Invested</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(finalData.totalContributions)}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl text-center shadow-lg border-l-4 border-yellow-400">
            <Zap className="mx-auto text-yellow-600 mb-3 animate-bounce" size={36} />
            <p className="text-lg font-semibold text-yellow-600">Interest Earned</p>
            <p className="text-3xl font-bold text-yellow-900">{formatCurrency(finalData.interestEarned)}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl text-center shadow-lg border-l-4 border-green-400">
            <TrendingUp className="mx-auto text-green-600 mb-3" size={36} />
            <p className="text-lg font-semibold text-green-600">Final Balance</p>
            <p className="text-3xl font-bold text-green-900">{formatCurrency(finalData.balance)}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl text-center shadow-lg border-l-4 border-blue-400">
            <Target className="mx-auto text-blue-600 mb-3" size={36} />
            <p className="text-lg font-semibold text-blue-600">Growth Rate</p>
            <p className="text-3xl font-bold text-blue-900">{formatPercent(effectiveRate)}</p>
          </div>
        </div>
      )}

      {finalData && (
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
            <TrendingUp className="text-green-500" /> Your Wealth Journey <Zap className="text-yellow-500" />
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -20 }} />
              <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
                      <p className="font-bold text-gray-800 mb-1">Year: {label}</p>
                      {payload.sort((a, b) => b.value - a.value).map((entry, index) => (
                        <p key={`item-${index}`} className="flex items-center gap-2 text-sm">
                          <span style={{ backgroundColor: entry.color }} className="w-3 h-3 rounded-full inline-block"></span>
                          {entry.name}: <span className="font-semibold">{formatCurrency(entry.value)}</span>
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }} />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" dataKey="totalContributions" stackId="1" stroke="#6b7280" fill="#6b7280" name="Contributions" />
              <Area type="monotone" dataKey="interestEarned" stackId="1" stroke="#10b981" fill="#10b981" name="Compound Interest" />
              <Line type="monotone" dataKey="simpleBalance" stroke="#ffc658" strokeWidth={3} dot={false} name="Simple Interest" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mind-Blowing Examples */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl shadow-lg mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
          <Zap className="text-yellow-500" /> Mind-Blowing Examples <Target className="text-blue-500" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h4 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Clock size={20} /> Time vs. Amount
            </h4>
            <div className="space-y-2 text-gray-700">
              <p><strong>฿100/month for 40 years:</strong> {formatCurrency(calculateExample(100, 40))}</p>
              <p><strong>฿200/month for 20 years:</strong> {formatCurrency(calculateExample(200, 20))}</p>
              <p className="text-green-600 font-bold">Double time &gt; Double amount!</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h4 className="text-xl font-bold text-purple-600 mb-3 flex items-center gap-2">
              <Banknote size={20} /> The Latte Factor
            </h4>
            <div className="space-y-2 text-gray-700">
              <p><strong>Daily ฿50 coffee: ฿1,500/month</strong></p>
              <p><strong>Invested for 30 years:</strong> {formatCurrency(calculateExample(1500, 30))}</p>
              <p className="text-red-600 font-bold">That's expensive coffee! ☕</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h4 className="text-xl font-bold text-green-600 mb-3 flex items-center gap-2">
              <TrendingUp size={20} /> Start Young
            </h4>
            <div className="space-y-2 text-gray-700">
              <p><strong>Age 20-65 (฿100/mo):</strong> {formatCurrency(calculateExample(100, 45))}</p>
              <p><strong>Age 30-65 (฿100/mo):</strong> {formatCurrency(calculateExample(100, 35))}</p>
              <p className="text-green-600 font-bold">10 years = {formatCurrency(calculateExample(100, 45) - calculateExample(100, 35))} difference!</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Science Behind the Magic */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-8 rounded-2xl shadow-lg">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
          <Calculator className="text-blue-500" /> The Science Behind the Magic
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-orange-700">How It Works:</h4>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <p>You invest money regularly</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <p>Your money earns returns (interest/growth)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <p>Your returns start earning returns too!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                <p>Growth accelerates exponentially over time</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-blue-700">Mathematical Proof:</h4>
            <p className="text-gray-700">
              The compound interest formula is FV = PV * (1 + r)^n, where FV is future value, PV is present value, r is the interest rate per period, and n is the number of periods. This derives from repeated multiplication: Starting with PV, after one period it's PV * (1 + r), after two it's PV * (1 + r)^2, and so on. For continuous compounding, it's FV = PV * e^(rt), but our app uses discrete periods.
            </p>
            <p className="text-gray-700">
              Proof: Assume P invested at rate r. After year 1: P + P*r = P(1+r). After year 2: P(1+r) + P(1+r)*r = P(1+r)^2. This pattern holds for n years.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

