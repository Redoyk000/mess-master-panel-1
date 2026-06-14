import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';

// আপনার ফায়ারবেস কনফিগারেশন (Firebase Configuration)
const firebaseConfig = {
  projectId: "hridoy-000",
  databaseURL: "https://hridoy-000-default-rtdb.firebaseio.com",
};

// ফায়ারবেস ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const useMessData = () => {
  const [loading, setLoading] = useState(true);
  const [messName, setMessName] = useState("Green View Mess");
  const [messManager, setMessManager] = useState("Mess Manager");
  
  // মেস মেম্বারদের লিস্ট ও প্রাথমিক ডেটা
  const [members, setMembers] = useState([
    { id: 'redoy', name: 'Redoy', role: 'Manager', meals: {}, deposit: 0, initialDeposit: 0 },
    { id: 'member1', name: 'Afridi', role: 'Member', meals: {}, deposit: 0, initialDeposit: 0 },
    { id: 'member2', name: 'Siam', role: 'Member', meals: {}, deposit: 0, initialDeposit: 0 }
  ]);

  // বাজারের খরচ ও ট্রানজেকশন হিস্ট্রি
  const [bazaars, setBazaars] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("জুন ২০২৬");

  // ফায়ারবেস থেকে লাইভ ডেটা লোড করা
  useEffect(() => {
    const messRef = ref(db, 'mess_data');
    onValue(messRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.messName) setMessName(data.messName);
        if (data.messManager) setMessManager(data.messManager);
        if (data.members) setMembers(data.members);
        if (data.bazaars) setBazaars(Object.values(data.bazaars || {}));
        if (data.transactions) setTransactions(Object.values(data.transactions || {}));
      }
      setLoading(false);
    });
  }, []);

  // টাকা জমা দেওয়ার মূল ফাংশন (সেফটি মোড ও লোকাল স্টোরেজ ব্যাকআপসহ)
  const addDeposit = async (memberId, amount, securityPin) => {
    // সিকিউরিটি পিন ভেরিফিকেশন (Default: 1234)
    if (securityPin !== "1234") {
      alert("ভুল সিকিউরিটি পিন! আবার চেষ্টা করুন।");
      return false;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("দয়া করে সঠিক টাকার পরিমাণ লিখুন।");
      return false;
    }

    // ক্র্যাশ থেকে বাঁচতে ইমিডিয়েট লোকাল স্টোরেজ ব্যাকআপ
    const newTxnId = "TXN-" + Math.floor(1000000000 + Math.random() * 9000000000);
    const newTransaction = {
      id: newTxnId,
      memberId: memberId,
      memberName: members.find(m => m.id === memberId)?.name || 'Unknown',
      amount: parsedAmount,
      date: new Date().toLocaleDateString('bn-BD'),
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      type: 'Deposit'
    };

    // লোকাল ব্যাকআপ সেভ
    const localBackup = JSON.parse(localStorage.getItem('shadowcount_backup') || '[]');
    localBackup.push(newTransaction);
    localStorage.setItem('shadowcount_backup', JSON.stringify(localBackup));

    // ফায়ারবেস ডেটাবেজ আপডেট
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return { ...m, deposit: (m.deposit || 0) + parsedAmount };
      }
      return m;
    });

    try {
      await set(ref(db, 'mess_data/members'), updatedMembers);
      const txRef = push(ref(db, 'mess_data/transactions'));
      await set(txRef, newTransaction);
      return newTransaction; // রসিদ জেনারেট করার জন্য ট্রানজেকশন ডেটা রিটার্ন
    } catch (error) {
      console.error("Firebase Update Failed:", error);
      alert("সার্ভার সমস্যা! তবে আপনার ডাটা লোকাল ব্যাকআপে সেভ হয়েছে।");
      return false;
    }
  };

  // বাজার খরচ যোগ করা
  const addBazaar = async (item, cost, memberId) => {
    const parsedCost = parseFloat(cost);
    const newBazaar = {
      id: 'BAZ-' + Date.now(),
      item,
      cost: parsedCost,
      buyerId: memberId,
      buyerName: members.find(m => m.id === memberId)?.name || 'Unknown',
      date: new Date().toLocaleDateString('bn-BD')
    };

    try {
      const bazRef = push(ref(db, 'mess_data/bazaars'));
      await set(bazRef, newBazaar);
      return true;
    } catch (error) {
      return false;
    }
  };

  // মিল (Meal) সংখ্যা আপডেট করা
  const updateMeals = async (memberId, dateKey, mealCount) => {
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        const updatedMeals = { ...(m.meals || {}), [dateKey]: mealCount };
        return { ...m, meals: updatedMeals };
      }
      return m;
    });

    await set(ref(db, 'mess_data/members'), updatedMembers);
  };

  // হিসাব-নিকাশ ক্যালকুলেশন লজিক
  const totalBazaarCost = bazaars.reduce((sum, b) => sum + (b.cost || 0), 0);
  
  const totalMeals = members.reduce((sum, m) => {
    const mealValues = Object.values(m.meals || {});
    return sum + mealValues.reduce((s, v) => s + parseFloat(v || 0), 0);
  }, 0);

  const mealRate = totalMeals > 0 ? (totalBazaarCost / totalMeals) : 0;

  return {
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
  };
};
