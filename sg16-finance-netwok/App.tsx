
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AiVerification } from './components/AiVerification';
import { LoanCalculator } from './components/LoanCalculator';
import { ChatBot } from './components/ChatBot';
import { DocumentScanner } from './components/DocumentScanner';
import { Auth } from './components/Auth';
import { AdminPanel } from './components/AdminPanel';
import { LoanAgreement } from './components/LoanAgreement';
import { User, LoanApplication, LoanParams, VerificationResult, DocumentAnalysisResult, ApplicationStatus, CountryCode, CountryConfig } from './types';
import { generateLoanAgreement } from './services/geminiService';

const COUNTRIES: Record<CountryCode, CountryConfig> = {
  // Southeast Asia
  SG: { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', phonePrefix: '+65', idName: 'NRIC', legalContext: 'MAS Act', minLoan: 5000, maxLoan: 250000, exchangeRate: 3.5 },
  MY: { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', phonePrefix: '+60', idName: 'MyKad', legalContext: 'Moneylenders Act', minLoan: 1000, maxLoan: 100000, exchangeRate: 1 },
  TH: { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', currencySymbol: '฿', phonePrefix: '+66', idName: 'Thai ID', legalContext: 'Civil Code', minLoan: 10000, maxLoan: 1000000, exchangeRate: 7.5 },
  ID: { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp', phonePrefix: '+62', idName: 'KTP', legalContext: 'OJK Regs', minLoan: 3000000, maxLoan: 300000000, exchangeRate: 3500 },
  VN: { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND', currencySymbol: '₫', phonePrefix: '+84', idName: 'CCCD', legalContext: 'SBV Regs', minLoan: 5000000, maxLoan: 500000000, exchangeRate: 5500 },
  PH: { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱', phonePrefix: '+63', idName: 'PhilSys ID', legalContext: 'RA 9474', minLoan: 5000, maxLoan: 500000, exchangeRate: 12 },
  
  // South Asia
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', phonePrefix: '+91', idName: 'Aadhaar', legalContext: 'RBI Code', minLoan: 10000, maxLoan: 1000000, exchangeRate: 18 },
  PK: { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', currencySymbol: '₨', phonePrefix: '+92', idName: 'CNIC', legalContext: 'Financial Ordinance', minLoan: 25000, maxLoan: 2500000, exchangeRate: 60 },
  BD: { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳', phonePrefix: '+880', idName: 'NID', legalContext: 'MRA Act', minLoan: 10000, maxLoan: 1000000, exchangeRate: 25 },
  LK: { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR', currencySymbol: 'Rs', phonePrefix: '+94', idName: 'NIC', legalContext: 'Consumer Credit Act', minLoan: 50000, maxLoan: 5000000, exchangeRate: 70 },
  NP: { code: 'NP', name: 'Nepal', flag: '🇳🇵', currency: 'NPR', currencySymbol: 'Rs', phonePrefix: '+977', idName: 'Citizenship ID', legalContext: 'Rastra Bank Act', minLoan: 15000, maxLoan: 1500000, exchangeRate: 28 },
};

const BackgroundEffects: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-luxury-950">
    
    {/* Deep Atmospheric Glows */}
    <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-900/10 to-transparent opacity-40 mix-blend-screen"></div>
    <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-gradient-to-t from-gold-900/10 to-transparent opacity-30 mix-blend-screen"></div>

    {/* World Map SVG - Deep & Living */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] max-w-[1600px] text-gold-500/20 animate-float">
       {/* Dropshadow for depth */}
       <div className="absolute inset-0 blur-xl bg-gold-500/5 rounded-full scale-90"></div>
       
      <svg viewBox="0 0 1000 450" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(184,134,11,0.1)]">
        <path d="M784.6,128.9c-2.3-1.4-5.9-2.2-7.8-0.8c-2.1,1.5-3.3,4.9-3.3,7.4c0,2.1,1.2,4.8,3.1,5.8c1.6,0.9,4.3,0.3,5.9-0.5 c2.7-1.4,4.7-4.1,4.9-7.1C787.5,131.7,786.5,130,784.6,128.9z M760.3,138.8c-1.3,0.3-2.6,0.9-3.7,1.8c-1.6,1.4-2.4,3.5-2.2,5.6 c0.2,2.3,1.6,4.3,3.6,5.4c2.5,1.4,5.8,1.1,8.1-0.5c1.7-1.2,2.9-3.1,3.2-5.1c0.3-2.1-0.5-4.3-2-5.8C765.7,138.9,763,138.1,760.3,138.8z M808.3,95.4c-1.8,0.7-3.4,2.2-4.2,4c-0.8,1.8-0.6,4.1,0.5,5.8c1.3,2,3.9,3.1,6.2,2.7c2.3-0.5,4.3-2.3,4.9-4.6 c0.5-1.9-0.1-4-1.4-5.5C813.1,96.5,810.8,95.6,808.3,95.4z M707.3,143.6c-2.5-0.7-5.4,0.3-6.9,2.5c-1.4,1.9-1.2,4.8,0.4,6.5 c1.7,1.8,4.5,2.4,6.8,1.4c2.2-0.9,3.8-3.3,3.9-5.7C711.6,146.1,709.8,144.2,707.3,143.6z M193.3,101.4c-2.8,0.4-5.2,2.6-5.8,5.4 c-0.6,2.5,0.4,5.4,2.5,7c2.2,1.7,5.5,1.7,7.7,0.1c2.1-1.6,3.3-4.5,2.8-7.1C199.9,103.9,197,101.3,193.3,101.4z M158.4,124.8 c-1.6,0.3-3,1.3-4,2.6c-1.5,2.1-1.5,5.1,0.1,7.2c1.7,2.2,4.8,2.9,7.2,1.7c2.3-1.2,3.8-3.9,3.4-6.5C164.8,127,162,124.6,158.4,124.8z M235.3,146.4c-1.8-1.5-4.6-2.1-6.8-1.3c-2.4,0.9-4.2,3.3-4.4,5.9c-0.2,2.7,1.4,5.3,3.9,6.5c2.5,1.3,5.7,0.8,7.6-1.1 c1.8-1.9,2.4-4.9,1.3-7.3C236.6,148.1,236.1,147.2,235.3,146.4z M584,287.6c-1.4,1.5-1.8,3.9-1,5.8c0.8,1.9,2.8,3.2,4.9,3.2 c2.1,0,4.2-1.3,5-3.2c0.9-2.1,0.2-4.7-1.5-6.1C589.6,285.6,586.3,286,584,287.6z M642.3,267.8c-1.9,1.1-3,3.3-2.8,5.4 c0.2,2.1,1.7,4,3.7,4.8c2.1,0.9,4.6,0.3,6.1-1.3c1.5-1.7,1.9-4.2,1-6.3C649.3,268.2,646.1,266.8,642.3,267.8z M610.1,299.1 c-1.9,1-3.1,3.1-3.1,5.2c0,2.2,1.2,4.3,3.2,5.3c2.2,1.2,4.9,0.7,6.6-1.1c1.8-1.8,2.2-4.7,1-6.9C616.4,299.2,613.3,298.2,610.1,299.1z M861.1,357.6c-2.2-0.5-4.5,0.7-5.7,2.7c-1.2,1.9-1.1,4.5,0.3,6.3c1.5,1.9,4.1,2.8,6.4,2c2.2-0.7,3.9-2.9,4.1-5.3 C866.4,360.7,864.4,358.3,861.1,357.6z M273.4,342.9c-2.2,0.6-4,2.5-4.5,4.8c-0.5,2.4,0.5,4.9,2.4,6.4c1.9,1.6,4.6,1.6,6.5,0.1 c1.9-1.5,3-4,2.5-6.4C279.7,345.1,277,342.7,273.4,342.9z M214.3,303.4c-1.4,0.3-2.6,1.2-3.4,2.3c-1.2,1.8-1.3,4.1-0.3,6 c1.1,2,3.3,3.2,5.6,3.1c2.2-0.1,4.3-1.6,5.1-3.7c0.8-2.1,0.2-4.6-1.5-6.1C218.4,303.8,216.3,303.2,214.3,303.4z M905.3,184.8 c-2.3,0.3-4.3,2-5,4.2c-0.7,2.2-0.1,4.7,1.6,6.3c1.7,1.6,4.3,2,6.4,0.9c2.1-1.1,3.4-3.4,3.2-5.7C911.3,187.7,908.9,185.3,905.3,184.8 z" opacity="0.8"/>
        <path d="M500,0C223.9,0,0,223.9,0,500s223.9,500,500,500s500-223.9,500-500S776.1,0,500,0z M885.5,176.6c1.1,4.4,0.6,9.1-1.4,13.2 c-2.2,4.6-6.2,8-11.1,9.4c-4.9,1.4-10.2,0.4-14.2-2.7c-4-3.1-6.6-7.7-7-12.7c-0.4-5.1,1.9-10,6.1-13.4c4.1-3.3,9.4-4.5,14.4-3.2 C880.5,168.7,884.2,172.1,885.5,176.6z M789.6,128.9c3.9,2.3,6.2,6.7,5.7,11.2c-0.5,4.6-3.8,8.5-8.2,9.9c-4.4,1.4-9.3-0.1-12.4-3.7 c-3.1-3.6-3.9-8.7-2-13c1.9-4.3,6.3-7.2,11-7.2C785.6,126.1,787.7,127.1,789.6,128.9z M764.1,139.7c4.6-1.2,9.4,0.3,12.5,4 c3.1,3.7,3.7,8.9,1.5,13.1c-2.2,4.2-6.9,6.9-11.6,6.6c-4.7-0.3-9-3.3-10.8-7.7c-1.8-4.4-0.8-9.4,2.6-12.7 C760,141.4,762,140.2,764.1,139.7z M810.2,96.3c4.2,0.3,8,3,9.8,6.8c1.8,3.9,1.3,8.4-1.3,11.8c-2.6,3.4-6.8,5.2-11.1,4.7 c-4.2-0.5-8-3.4-9.7-7.4c-1.6-4,0.8-8.6,4.6-11.1C805,99.5,807.7,98.6,810.2,96.3z M707.3,143.6c4.1,1.1,7.2,4.5,7.9,8.7 c0.7,4.2-1.3,8.4-5,10.8c-3.7,2.4-8.4,2.3-11.9-0.2c-3.5-2.5-5.2-6.8-4.2-11C695.1,146.7,699.9,143.2,707.3,143.6z M586.2,286.9 c3.9-2.7,9.3-2.8,13.3-0.2c4,2.6,6.1,7.3,5.2,12c-0.9,4.7-4.4,8.5-8.9,9.7c-4.5,1.2-9.4-0.4-12.6-4.1c-3.2-3.7-4-8.9-1.9-13.3 C582.5,289,584.2,287.8,586.2,286.9z M643.1,267.7c6.6-1.7,13.4,1.4,16.5,7.5c3.1,6.1,1.6,13.6-3.7,18c-5.3,4.4-12.9,4.2-18-0.5 c-5.1-4.7-6.2-12.4-2.6-18.3C637,270.6,639.8,268.5,643.1,267.7z M610.1,299.1c5.4-1.5,11,1.1,13.7,6.1c2.6,5.1,1.4,11.3-3.1,15 c-4.4,3.7-10.9,3.5-15.1-0.4c-4.2-3.9-5.2-10.4-2.2-15.3C605,301.6,607.3,299.8,610.1,299.1z M861.1,357.6c3.8,1.2,6.5,4.7,6.8,8.7 c0.3,4-2,7.7-5.6,9.5c-3.6,1.8-8,1.2-11-1.5c-3-2.7-4.1-6.9-2.8-10.7C849.8,360,854.7,357,861.1,357.6z M273.4,342.9 c6-0.3,11.3,3.3,13.1,8.9c1.9,5.7-0.5,11.9-5.7,14.9c-5.2,3-11.8,2.1-16.1-2.2c-4.3-4.3-4.8-11-1.1-15.9 C266,345.5,269.5,343.1,273.4,342.9z M214.3,303.4c2.5-0.2,5,0.7,6.8,2.5c4,4,4,10.5-0.1,14.5c-4,4-10.5,4-14.5-0.1 c-4-4.1-3.9-10.6,0.2-14.6C208.7,303.8,211.5,303,214.3,303.4z M193.3,101.4c6.3-0.2,11.8,4.1,13.2,10.2c1.4,6.2-1.9,12.5-7.7,15 c-5.8,2.5-12.6-0.1-15.8-5.9c-3.2-5.9-2.1-13.1,2.8-17.8C188,102,190.6,101.5,193.3,101.4z M158.4,124.8c4,0.1,7.5,2.6,9.1,6.3 c1.6,3.7,0.7,8-2.3,10.9c-2.9,2.8-7.4,3.6-11,2c-3.6-1.6-6-5.4-5.8-9.3C148.5,129.5,152.8,125.6,158.4,124.8z M235.3,146.4 c3.9,1.4,6.4,5.4,6.2,9.6c-0.2,4.2-3.1,7.9-7.1,9.1c-4,1.2-8.3-0.4-10.7-3.9c-2.4-3.5-2.3-8.2,0.4-11.6 C226.7,147.2,230.9,145.4,235.3,146.4z" />
      </svg>
      
      {/* Radar Scan Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold-500/20 to-transparent h-[10px] w-full blur-md animate-scan-line opacity-50"></div>
    </div>

    {/* Floating Orbs for "Softness" */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[120px] animate-pulse-slow"></div>
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }}></div>
  </div>
);

const App: React.FC = () => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // App Flow State
  const [view, setView] = useState<'DASHBOARD' | 'APPLY_WIZARD' | 'ADMIN'>('DASHBOARD');
  const [wizardStep, setWizardStep] = useState(1);
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [generatedAgreementText, setGeneratedAgreementText] = useState('');

  // Application Data Cache
  const [loanParams, setLoanParams] = useState<LoanParams>({ amount: 5000, months: 12 });
  const [docResult, setDocResult] = useState<DocumentAnalysisResult | null>(null);
  const [verifResult, setVerifResult] = useState<VerificationResult | null>(null);

  // --- EFFECT: Install Prompt Capture ---
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // --- HANDLERS ---

  const handleRegister = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setView('ADMIN');
    } else {
      setView('DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('DASHBOARD');
  };

  const startApplication = () => {
    setWizardStep(1);
    setView('APPLY_WIZARD');
  };

  const handleWizardNext = () => {
    setWizardStep(prev => prev + 1);
  };

  const handleVerificationSuccess = async (result: VerificationResult) => {
    setVerifResult(result);
    // Auto generate agreement
    if (currentUser) {
      setLoadingAgreement(true);
      const countryConfig = COUNTRIES[currentUser.country];
      const monthlyPayment = (loanParams.amount * 0.05 * (loanParams.months/12) + loanParams.amount) / loanParams.months;
      
      const text = await generateLoanAgreement(
        currentUser.name, 
        currentUser.icNumber, 
        loanParams.amount, 
        loanParams.months, 
        monthlyPayment,
        currentUser.country,
        countryConfig.currencySymbol
      );
      setGeneratedAgreementText(text);
      setLoadingAgreement(false);
      setShowAgreement(true);
    }
  };

  const handleAgreementConfirm = () => {
    if (!currentUser) return;
    
    const monthlyPayment = (loanParams.amount * 0.05 * (loanParams.months/12) + loanParams.amount) / loanParams.months;
    
    const newApp: LoanApplication = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: currentUser.id,
      userName: currentUser.name,
      icNumber: currentUser.icNumber,
      country: currentUser.country,
      amount: loanParams.amount,
      months: loanParams.months,
      monthlyPayment: monthlyPayment,
      documentResult: docResult,
      verificationResult: verifResult,
      status: 'MATCHING_LENDER', // Initial state
      agreementText: generatedAgreementText,
      isSigned: true,
      submittedAt: new Date()
    };

    setApplications([...applications, newApp]);
    setShowAgreement(false);
    setView('DASHBOARD');
    
    // Simulate AI Matching Process
    setTimeout(() => {
        alert("Sg16 Finance: Application Submitted. AI Broker active.");
    }, 1000);
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus) => {
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status } : a));
  };

  // --- RENDER HELPERS ---

  const renderStatusCard = (app: LoanApplication) => {
    const countryConfig = COUNTRIES[app.country];
    const getStatusStyle = () => {
      switch(app.status) {
        case 'APPROVED': return 'border-green-600 bg-green-950/40 text-green-400';
        case 'MATCHING_LENDER': return 'border-gold-600/50 bg-gold-900/10 text-gold-400';
        case 'REJECTED': return 'border-red-800 bg-red-950/40 text-red-500';
        case 'NEEDS_DOCUMENTS': return 'border-blue-800 bg-blue-950/40 text-blue-400';
        default: return 'border-gray-700 bg-gray-900/50 text-gray-400';
      }
    };

    return (
      <div key={app.id} className={`p-6 rounded-xl border-l-2 ${getStatusStyle()} glass-panel mb-4`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-serif font-bold text-lg text-white">Ref: {app.id}</h4>
            <p className="text-sm text-gray-500 font-mono text-[10px] uppercase tracking-widest">Logged: {app.submittedAt.toLocaleDateString()}</p>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase py-1 px-3 bg-black/50 rounded-full border border-white/5">
            {app.status.replace('_', ' ')}
          </span>
        </div>
        <div className="mt-4 flex gap-8 text-sm items-center">
           <div>
              <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Request</span>
              <span className="text-white font-serif italic text-xl">{countryConfig.currencySymbol} {app.amount.toLocaleString()}</span>
           </div>
           <div className="h-8 w-[1px] bg-white/10"></div>
           <div>
              <span className="text-gray-500 text-[10px] uppercase tracking-widest block mb-1">Tenure</span>
              <span className="text-white font-mono">{app.months} Mo</span>
           </div>
        </div>
        
        {app.status === 'MATCHING_LENDER' && (
           <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gold-500 flex items-center gap-3 font-mono uppercase tracking-widest">
             <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-ping"></div>
             Negotiating with Institutional Partners...
           </div>
        )}

        {app.status === 'APPROVED' && (
           <div className="mt-4 bg-green-900/20 p-3 rounded text-xs text-green-400 border border-green-500/20 font-mono">
             FUNDS RELEASED. NO BROKERAGE FEE.
           </div>
        )}
      </div>
    );
  };

  // --- MAIN RENDER ---

  if (!currentUser) {
    return (
      <>
        <BackgroundEffects />
        <Auth onLogin={handleLogin} users={users} onRegister={handleRegister} />
      </>
    );
  }

  const countryConfig = COUNTRIES[currentUser.country];

  if (view === 'ADMIN' && currentUser.role === 'ADMIN') {
    return (
      <>
        <BackgroundEffects />
        <AdminPanel applications={applications} onUpdateStatus={updateApplicationStatus} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-20">
      <BackgroundEffects />
      <Navbar onInstallApp={deferredPrompt ? handleInstallClick : undefined} />

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* Welcome Header */}
        <div className="flex justify-between items-end mb-16 mt-8">
          <div>
            <h1 className="text-5xl font-serif text-white italic mb-2 text-gradient-gold drop-shadow-lg">
              Welcome, {currentUser.name.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-4">
               {currentUser.role !== 'BORROWER' ? (
                 <span className="px-3 py-1 bg-gold-600/20 border border-gold-500 rounded-full text-[10px] text-gold-400 uppercase tracking-widest font-bold">
                    {currentUser.role === 'AGENT_COMPANY' ? 'Corporate Partner' : 'Licensed Agent'}
                 </span>
               ) : (
                 <span className="px-3 py-1 bg-gold-600/10 border border-gold-600/30 rounded-full text-[10px] text-gold-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg leading-none">{countryConfig.flag}</span>
                    {countryConfig.name} Portfolio
                 </span>
               )}
               {currentUser.isVerified && <span className="text-green-500 text-[10px] uppercase tracking-widest">Biometrics Verified</span>}
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors border-b border-transparent hover:border-white pb-1">Sign Out</button>
        </div>

        {/* Dashboard View */}
        {view === 'DASHBOARD' && (
          <div className="space-y-12 animate-fade-in">
            {/* Action Section */}
            <div className="grid md:grid-cols-2 gap-8">
               {/* Hero Action Card */}
               <div className="relative group overflow-hidden rounded-3xl p-10 border border-gold-600/20 bg-luxury-900">
                 {/* Decorative Glow */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-gold-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 
                 {currentUser.role === 'BORROWER' ? (
                   <>
                    <h3 className="text-3xl font-serif text-white mb-4 relative z-10 italic">Secure Capital</h3>
                    <p className="text-gray-400 mb-10 relative z-10 text-sm leading-relaxed max-w-sm font-light">
                      Initialize AI negotiation with our regulated banking partners in {countryConfig.name}. 
                      Zero client-side fees.
                    </p>
                    <button onClick={startApplication} className="relative z-10 bg-gold-gradient text-black hover:scale-[1.02] px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(184,134,11,0.2)] flex items-center gap-3 text-xs tracking-[0.2em] uppercase border border-gold-400/30">
                      Initiate Request
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </button>
                   </>
                 ) : (
                    <>
                    <h3 className="text-3xl font-serif text-white mb-4 relative z-10 italic">Agent Portal</h3>
                    <p className="text-gray-400 mb-10 relative z-10 text-sm leading-relaxed max-w-sm font-light">
                      Submit a new client application on their behalf. Commission tracking is automated.
                    </p>
                    <button onClick={startApplication} className="relative z-10 bg-gold-gradient text-black hover:scale-[1.02] px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(184,134,11,0.2)] flex items-center gap-3 text-xs tracking-[0.2em] uppercase border border-gold-400/30">
                      New Client Application
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                   </>
                 )}
               </div>
               
               {/* Calculator Card */}
               <div className="glass-panel p-0 rounded-3xl overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="font-serif text-white italic text-xl">Market Estimator</h3>
                    <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></div>
                 </div>
                 <div className="p-8 flex-1">
                    <LoanCalculator countryConfig={countryConfig} />
                 </div>
               </div>
            </div>

            {/* Status Section */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-serif text-white italic">Active Portfolios</h2>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>
              
              {applications.filter(a => a.userId === currentUser.id).length > 0 ? (
                applications.filter(a => a.userId === currentUser.id).map(renderStatusCard)
              ) : (
                <div className="p-16 rounded-2xl border border-dashed border-gray-800 text-center">
                  <p className="text-gray-600 font-serif italic text-xl mb-3">No capital requests active.</p>
                  <button onClick={startApplication} className="text-gold-500 text-xs uppercase tracking-widest hover:text-white transition-colors">Begin New Request</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Wizard */}
        {view === 'APPLY_WIZARD' && (
          <div className="max-w-4xl mx-auto">
            {/* Elegant Progress Steps */}
            <div className="flex items-center justify-between mb-16 px-12 relative">
               <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-800 -z-10"></div>
               
               {[1, 2, 3].map((step) => (
                 <div key={step} className={`relative flex flex-col items-center gap-3 bg-luxury-950 px-4 transition-colors ${wizardStep >= step ? 'text-gold-500' : 'text-gray-700'}`}>
                    <div className={`w-3 h-3 rounded-full border-2 ${wizardStep >= step ? 'bg-gold-500 border-gold-500 shadow-[0_0_10px_#B8860B]' : 'bg-black border-gray-700'}`}></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                      {step === 1 ? 'Terms' : step === 2 ? 'Documents' : 'Verify'}
                    </span>
                 </div>
               ))}
            </div>

            {/* Step 1: Calculator */}
            {wizardStep === 1 && (
              <div className="glass-panel-premium p-10 rounded-3xl animate-fade-in">
                <div className="text-center mb-10">
                   <h3 className="text-4xl font-serif text-white mb-2 italic text-gradient-gold">Capital Requirements</h3>
                   <p className="text-gray-500 text-sm font-light">Define your funding structure in {countryConfig.currency}.</p>
                </div>
                
                <LoanCalculator countryConfig={countryConfig} onParamsChange={setLoanParams} />
                
                <div className="mt-10 flex justify-center">
                   <button onClick={handleWizardNext} className="bg-white text-black hover:bg-gold-100 px-12 py-4 rounded-xl font-bold transition-all shadow-lg text-xs tracking-[0.2em] uppercase">
                     Continue to Validation
                   </button>
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {wizardStep === 2 && (
              <div className="glass-panel-premium p-10 rounded-3xl animate-fade-in min-h-[600px] flex flex-col">
                <div className="text-center mb-10">
                   <h3 className="text-4xl font-serif text-white mb-2 italic text-gradient-gold">Financial Validation</h3>
                   <p className="text-gray-500 text-sm font-light">AI Forensic analysis of Proof of Income.</p>
                </div>
                
                <div className="flex-1">
                   <DocumentScanner country={currentUser.country} onAnalyzeComplete={(res) => {
                     setDocResult(res);
                   }} />
                </div>

                <div className="mt-10 flex justify-between items-center border-t border-white/5 pt-8">
                   <button onClick={() => setWizardStep(1)} className="text-gray-500 hover:text-white text-xs uppercase tracking-widest">Back</button>
                   <button 
                    disabled={!docResult}
                    onClick={handleWizardNext} 
                    className={`px-10 py-4 rounded-xl font-bold transition-all text-xs tracking-[0.2em] uppercase ${docResult ? 'bg-gold-gradient text-black hover:scale-[1.02]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                   >
                     Proceed to Biometrics
                   </button>
                </div>
              </div>
            )}

             {/* Step 3: Identity Verification */}
             {wizardStep === 3 && (
              <div className="glass-panel-premium p-10 rounded-3xl animate-fade-in">
                <div className="text-center mb-10">
                   <h3 className="text-4xl font-serif text-white mb-2 italic text-gradient-gold">Biometric Security</h3>
                   <p className="text-gray-500 text-sm font-light">Verification against {countryConfig.legalContext} database.</p>
                </div>
                
                <div className="max-w-xl mx-auto">
                   <AiVerification country={currentUser.country} onVerified={handleVerificationSuccess} />
                </div>
                
                {loadingAgreement && (
                  <div className="mt-12 text-center bg-gold-600/5 p-8 rounded-xl border border-gold-600/20 animate-pulse-slow">
                    <div className="w-12 h-12 mx-auto mb-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gold-400 font-serif italic text-2xl">Identity Confirmed.</p>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em]">Drafting Legal Contract via Gemini AI Engine...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <ChatBot />

      {/* Agreement Modal */}
      {showAgreement && (
        <LoanAgreement 
          agreementText={generatedAgreementText} 
          onConfirm={handleAgreementConfirm}
          onCancel={() => setShowAgreement(false)}
        />
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
