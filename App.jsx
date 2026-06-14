import React, { useState } from 'react';
import { useMessData } from './useMessData';
import MemberDashboard from './MemberDashboard';
import { 
  Lock, 
  Unlock, 
  Utensils, 
  TrendingUp, 
  PlusCircle, 
  Users, 
  ShieldAlert 
} from 'lucide-react';

export default function App() {
  const {
    loading,
    messName,
    messManager,
    members,
    bazaars,
    transactions,
    currentMonth,
    totalBazaarCost,
    totalMeals,
    mealRate,
    addDeposit,
    addBazaar,
    updateMeals
  } = useMessData();

  // অ্যাডমিন নাকি মেম্বার প্যানেল দেখাবে তার স্টেট
  const [activeTab, setActiveTab] = useState('member'); // 'admin' or 'member'
  
  // ফর্ম ইনপুট স্টেটসমূহ
  const [selectedMemberId, setSelectedMemberId] = useState('redoy');
  const [depositAmount, setDepositAmount] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  
  const [bazaarItem, setBazaarItem] = useState('');
  const [bazaarCost, setBazaarCost] = useState('');
  const [bazaarBuyerId, setBazaarBuyerId] = useState('redoy');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-indigo-400 font-bold text-lg">
        <div className="animate-pulse">ShadowCount ডাটাবেজ লোড হচ্ছে...</div>
      </div>
    );
  }

  // টাকা জমার সাবমিট হ্যান্ডলার
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const success = await addDeposit(selectedMemberId, depositAmount, securityPin);
    if (success) {
      alert(`৳${depositAmount} সফলভাবে জমা হয়েছে এবং এটিএম রসিদ তৈরি হয়েছে!`);
      setDepositAmount('');
      setSecurityPin('');
    }
  };

  // বাজার খরচের সাবমিট হ্যান্ডলার
  const handleBazaarSubmit = async (e) => {
    e.preventDefault();
    const success = await addBazaar(bazaarItem, bazaarCost, bazaarBuyerId);
    if (success) {
      alert("বাজার খরচ সফলভাবে যুক্ত হয়েছে!");
      setBazaarItem('');
      setBazaarCost('');
    } else {
      alert("যোগ করতে ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 font-sans pb-12">
      {/* টপ হেডার বার */}
      <header className="bg-[#111827] border-b border-slate-800 py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/30 font-black text-xl">
              SC
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">{messName}</h1>
              <p className="text-xs text-indigo-400 flex items-center gap-1">
                <span>Manager: {messManager}</span> • <span className="text-slate-400">{currentMonth}</span>
              </p>
            </div>
          </div>

          {/* ট্যাব সিলেক্টর বাটন */}
          <div className="flex bg-[#1e293b] p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('member')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'member' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👤 Member Dashboard
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'admin' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔒 Admin Panel
            </button>
          </div>
        </div>
      </header>

      {/* মেইন কনটেন্ট এরিয়া */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* টোটাল মেস ওভারভিউ স্ক্রিন (সবসময় উপরে থাকবে) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111827] p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">মোট মেস বাজার</p>
            <p className="text-xl font-black text-rose-400 mt-1">৳{totalBazaarCost}</p>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">মোট মেস মিল</p>
            <p className="text-xl font-black text-indigo-400 mt-1">{totalMeals} টি</p>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">বর্তমান মিল রেট</p>
            <p className="text-xl font-black text-amber-400 mt-1">৳{mealRate.toFixed(2)}</p>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">মোট মেম্বার</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{members.length} জন</p>
          </div>
        </div>

        {/* ট্যাব অনুযায়ী কন্ডিশনাল রেন্ডারিং */}
        {activeTab === 'member' ? (
          <MemberDashboard 
            members={members} 
            transactions={transactions} 
            currentMonth={currentMonth}
            totalMeals={totalMeals}
            mealRate={mealRate}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ফিন্যান্সিয়াল কন্ট্রোল: টাকা জমা দিন ফর্ম */}
            <div className="bg-[#111827] p-5 rounded-xl border border-slate-800/80 shadow-xl">
              <h3 className="text-md font-bold mb-4 text-emerald-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> মেস ফান্ডে টাকা জমা দিন
              </h3>
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">মেম্বার সিলেক্ট করুন</label>
                  <select 
                    value={selectedMemberId} 
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">টাকার পরিমাণ (৳)</label>
                  <input 
                    type="number" 
                    placeholder="যেমন: 2000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> সিকিউরিটি পিন (Default: 1234)
                  </label>
                  <input 
                    type="password" 
                    placeholder="••••"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                  তহবিল আপডেট ও রসিদ জেনারেট করুন
                </button>
              </form>
            </div>

            {/* মেসের ডেইলি বাজার এন্ট্রি ফর্ম */}
            <div className="bg-[#111827] p-5 rounded-xl border border-slate-800/80 shadow-xl">
              <h3 className="text-md font-bold mb-4 text-rose-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> নতুন বাজার খরচ যোগ করুন
              </h3>
              <form onSubmit={handleBazaarSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">বাজারের বিবরণ (জিনিসের নাম)</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: চাল, ডাল, মুরগির মাংস"
                    value={bazaarItem}
                    onChange={(e) => setBazaarItem(e.target.value)}
                    className="w-full bg-
