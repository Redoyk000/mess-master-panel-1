import React, { useState } from 'react';
// lucide-react থেকে প্রয়োজনীয় সব আইকন ইম্পোর্ট করা হলো (Download সহ)
import { 
  ChevronDown, 
  Utensils, 
  BookOpen, 
  Pencil, 
  Download, 
  Calendar, 
  DollarSign, 
  User 
} from 'lucide-react';

export default function MemberDashboard({ members, transactions, currentMonth, totalMeals, mealRate }) {
  const [selectedMember, setSelectedMember] = useState('redoy');
  const [receiptPopup, setReceiptPopup] = useState(null);

  // সিলেক্টেড মেম্বারের ডেটা বের করা
  const activeMember = members.find(m => m.id === selectedMember) || members[0];

  // নির্দিষ্ট মেম্বারের জমার ইতিহাস ফিল্টার করা
  const memberTxns = transactions.filter(t => t.memberId === selectedMember);

  // মেম্বারের টোটাল মিল গণনা
  const memberTotalMeals = Object.values(activeMember?.meals || {}).reduce((sum, v) => sum + parseFloat(v || 0), 0);
  
  // মেম্বারের মোট বাজার খরচ (যদি সে ম্যানেজার বা বাজার করে থাকে)
  const memberTotalDeposit = activeMember?.deposit || 0;
  const memberMealCost = memberTotalMeals * mealRate;
  const balance = memberTotalDeposit - memberMealCost;

  // থার্মাল রসিদ প্রিন্ট/ডাউনলোড করার ফাংশন
  const handlePrintReceipt = (txn) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>রসিদ - ${txn.id}</title>
          <style>
            @media print {
              body { width: 80mm; font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 10px; }
              .receipt-container { width: 100%; text-align: center; }
              .line { border-bottom: 1px dashed #000; margin: 10px 0; }
              .details { text-align: left; margin-bottom: 5px; }
              .flex-row { display: flex; justify-content: space-between; }
              .bold { font-weight: bold; }
            }
            body { font-family: sans-serif; padding: 20px; display: flex; justify-content: center; background: #f0f0f0; }
            .receipt-box { background: white; padding: 20px; border: 1px solid #ccc; width: 300px; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .btn-print { background: #6366f1; color: white; border: none; padding: 8px 15px; margin-top: 15px; cursor: pointer; border-radius: 4px; font-weight: bold;}
          </style>
        </head>
        <body>
          <div class="receipt-box receipt-container">
            <h3>*** ShadowCount ***</h3>
            <p>Smart Mess Manager</p>
            <div class="line"></div>
            <div class="details flex-row"><span class="bold">রসিদ নং:</span> <span>${txn.id}</span></div>
            <div class="details flex-row"><span class="bold">তারিখ:</span> <span>${txn.date}</span></div>
            <div class="details flex-row"><span class="bold">সময়:</span> <span>${txn.time}</span></div>
            <div class="line"></div>
            <div class="details flex-row"><span class="bold">সদস্যের নাম:</span> <span>${txn.memberName}</span></div>
            <div class="details flex-row"><span class="bold">বিবরণ:</span> <span>মেস তহবিল জমা</span></div>
            <div class="line"></div>
            <div class="details flex-row bold" style="font-size: 16px;"><span>মোট পরিমাণ:</span> <span>৳${txn.amount}</span></div>
            <div class="line"></div>
            <p>ধন্যবাদ, টাকা সফলভাবে জমা হয়েছে।</p>
            <p style="font-size: 10px;">Powered by Replit Agent</p>
            <button class="btn-print" onclick="window.print()">প্রিন্ট করুন / PDF সেভ</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-[#0f172a] text-slate-200 p-4 rounded-xl shadow-2xl max-w-4xl mx-auto border border-slate-800">
      {/* মেম্বার সিলেক্টর ড্রপডাউন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
            <User className="w-5 h-5" /> মেম্বার ড্যাশবোর্ড
          </h2>
          <p className="text-xs text-slate-400 mt-1">আপনার ব্যক্তিগত মেস হিসাব পরীক্ষা করুন</p>
        </div>
        <div className="relative w-full sm:w-48">
          <select 
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 appearance-none focus:outline-none focus:border-indigo-500"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* মেম্বার সামারি কার্ডস */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">মোট জমা</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">৳{memberTotalDeposit}</p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500/20" />
        </div>
        <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">মোট মিল ({currentMonth})</p>
            <p className="text-xl font-bold text-indigo-400 mt-1">{memberTotalMeals} টি</p>
          </div>
          <Utensils className="w-8 h-8 text-indigo-500/20" />
        </div>
        <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">বর্তমান ব্যালেন্স</p>
            <p className={`text-xl font-bold mt-1 ${balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              ৳{balance.toFixed(2)}
            </p>
          </div>
          <Calendar className="w-8 h-8 text-blue-500/20" />
        </div>
      </div>

      {/* জমার ইতিহাস ও রসিদ টেবিল */}
      <div className="bg-[#1e293b] rounded-lg border border-slate-800 p-4">
        <h3 className="text-md font-bold mb-4 text-slate-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" /> জমার ইতিহাস ও রসিদ
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase bg-[#111827] text-slate-300 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">সময় & তারিখ</th>
                <th className="px-4 py-3">পরিমাণ</th>
                <th className="px-4 py-3">ট্রানজেকশন আইডি</th>
                <th className="px-4 py-3 text-right">রসিদ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {memberTxns.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-slate-500 text-xs">কোনো জমার রেকর্ড খুঁজে পাওয়া যায়নি</td>
                </tr>
              ) : (
                memberTxns.map(txn => (
                  <tr key={txn.id} className="hover:bg-[#111827]/50 transition-colors">
                    <td className="px-4 py-3 text-xs">
                      <div>{txn.time}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{txn.date}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">৳{txn.amount}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{txn.id}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setReceiptPopup(txn)}
                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 ml-auto border border-indigo-500/30 transition-all font-semibold"
                      >
                        <Download className="w-3 h-3" /> ডাউনলোড করুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* এটিএম থার্মাল রসিদ পপ-আপ মডাল */}
      {receiptPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 p-5 rounded-lg max-w-xs w-full shadow-2xl border-2 border-slate-200 text-center relative font-mono text-xs">
            <h4 className="text-md font-bold tracking-wider">*** SHADOWCOUNT ***</h4>
            <p className="text-[10px] text-slate-500">Smart Mess Manager</p>
            <div className="border-b border-dashed border-slate-400 my-3"></div>
            
            <div className="text-left space-y-1">
              <div className="flex justify-between"><span>রসিদ আইডি:</span><span className="font-bold">{receiptPopup.id}</span></div>
              <div className="flex justify-between"><span>তারিখ:</span><span>{receiptPopup.date}</span></div>
              <div className="flex justify-between"><span>সময়:</span><span>{receiptPopup.time}</span></div>
              <div className="border-b border-dashed border-slate-300 my-2"></div>
              <div className="flex justify-between"><span>সদস্য:</span><span className="font-bold">{receiptPopup.memberName}</span></div>
              <div className="flex justify-between"><span>বিবরণ:</span><span>তহবিল জমা</span></div>
            </div>

            <div className="border-b border-dashed border-slate-400 my-3"></div>
            <div className="flex justify-between text-base font-bold px-1">
              <span>মোট পরিমাণ:</span>
              <span>৳{receiptPopup.amount}</span>
            </div>
            <div className="border-b border-dashed border-slate-400 my-3"></div>
            
            <p className="text-[10px] text-slate-500 leading-tight">টাকা মেস ফায়ারবেস ডেটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে।</p>
            
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => handlePrintReceipt(receiptPopup)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded text-xs transition-colors"
              >
                প্রিন্ট / PDF ডাউনলোড
              </button>
              <button 
                onClick={() => setReceiptPopup(null)}
                className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded text-xs transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
