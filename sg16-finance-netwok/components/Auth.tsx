
import React, { useState, useEffect } from 'react';
import { User, CountryCode, CountryConfig, UserRole, VerificationResult } from '../types';
import { AiVerification } from './AiVerification';

interface AuthProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: User) => void;
}

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

export const Auth: React.FC<AuthProps> = ({ onLogin, users, onRegister }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'OTP' | 'SET_PASSWORD' | 'AGENT_VERIFICATION'>('LOGIN');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('MY');
  const [selectedRole, setSelectedRole] = useState<UserRole>('BORROWER');
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [detectingText, setDetectingText] = useState('Locating Node...');
  
  const [formData, setFormData] = useState({
    mobile: '',
    ic: '',
    name: '',
    password: '',
    confirmPassword: '',
    otp: '',
    // Company Agent Fields
    companyName: '',
    companyRegNo: '',
    companyAddress: ''
  });
  
  const [tempUser, setTempUser] = useState<Partial<User> | null>(null);
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);

  const countryConfig = COUNTRIES[selectedCountry];

  useEffect(() => {
    // Simulate complex node hopping for premium effect
    const sequence = [
      { text: "Ping: Singapore (SG-1)", country: 'SG' },
      { text: "Ping: India (IN-West)", country: 'IN' },
      { text: "Ping: Thailand (BKK-Core)", country: 'TH' },
      { text: "Ping: Pakistan (PK-Net)", country: 'PK' },
      { text: "Optimizing Route...", country: 'MY' }
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < sequence.length) {
        setDetectingText(sequence[step].text);
        step++;
      } else {
        clearInterval(interval);
        // Default to Singapore/Malaysia or random
        setSelectedCountry('SG'); 
        setIsAutoDetecting(false);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.mobile === formData.mobile || u.icNumber === formData.ic)) {
      alert("Mobile number or IC already registered.");
      return;
    }
    
    setTempUser({
      mobile: formData.mobile,
      icNumber: formData.ic,
      name: formData.name,
      country: selectedCountry,
      role: selectedRole,
      companyDetails: selectedRole === 'AGENT_COMPANY' ? {
        name: formData.companyName,
        regNo: formData.companyRegNo,
        address: formData.companyAddress
      } : undefined
    });
    
    setTimeout(() => {
      setNotification({
        title: 'MESSAGES • now',
        message: 'Sg16 Verification: Your secure code is 123456.'
      });
      setTimeout(() => setNotification(null), 6000);
    }, 1500);
    
    setView('OTP');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp === '123456') {
      setView('SET_PASSWORD');
    } else {
      alert("Invalid OTP");
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    // If Personal Agent, require Biometric Verification NOW
    if (selectedRole === 'AGENT_PERSONAL') {
       setView('AGENT_VERIFICATION');
    } else {
       finalizeRegistration();
    }
  };

  const finalizeRegistration = (verificationResult?: VerificationResult) => {
    if (tempUser && tempUser.mobile && tempUser.icNumber && tempUser.name && tempUser.country) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        mobile: tempUser.mobile,
        icNumber: tempUser.icNumber,
        name: tempUser.name,
        password: formData.password,
        country: tempUser.country,
        role: tempUser.role || 'BORROWER',
        companyDetails: tempUser.companyDetails,
        isVerified: !!verificationResult?.isMatch
      };
      
      onRegister(newUser);
      onLogin(newUser);
    }
  };

  const handleAgentVerified = (result: VerificationResult) => {
     if (result.isMatch) {
       finalizeRegistration(result);
     }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mobile === 'admin' && formData.password === 'admin123') {
      onLogin({ 
        id: 'admin', mobile: 'admin', icNumber: '000', name: 'System Administrator', 
        password: '', role: 'ADMIN', isAdmin: true, country: 'MY' 
      });
      return;
    }

    const user = users.find(u => u.mobile === formData.mobile && u.password === formData.password);
    if (user) {
      onLogin(user);
    } else {
      alert("Invalid credentials.");
    }
  };

  const handleSocialLogin = () => {
    setView('SIGNUP');
  };

  if (isAutoDetecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
           <div className="w-[600px] h-[600px] border border-gold-500 rounded-full animate-ping opacity-10"></div>
           <div className="absolute w-[400px] h-[400px] border border-gold-500 rounded-full animate-ping opacity-20 delay-100"></div>
           <div className="absolute w-[200px] h-[200px] border border-gold-500 rounded-full animate-ping opacity-30 delay-200"></div>
        </div>
        
        <div className="w-20 h-20 border-t-2 border-l-2 border-gold-500 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(184,134,11,0.4)]"></div>
        <div className="text-gold-500 font-serif italic text-xl tracking-widest animate-pulse">
          Establishing Secure Uplink
        </div>
        <div className="text-gray-600 font-mono text-xs mt-2 uppercase tracking-[0.3em]">
          {detectingText}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 bg-world-map opacity-80"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-spin-slow pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }}></div>

      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-[90%] max-w-sm">
          <div className="bg-gray-200/90 backdrop-blur-md text-black p-4 rounded-2xl shadow-2xl border border-white/20 flex items-start gap-3">
             <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
               💬
             </div>
             <div>
               <div className="text-xs font-bold uppercase text-gray-500 flex justify-between w-56">
                 {notification.title}
               </div>
               <div className="font-semibold text-sm mt-0.5">
                 {notification.message}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Special View for Agent Verification */}
      {view === 'AGENT_VERIFICATION' ? (
         <div className="w-full max-w-2xl relative z-10 animate-fade-in">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-serif text-gold-500 italic">Agent Identity Protocol</h2>
               <p className="text-gray-400 text-sm mt-2">Live AI Verification is mandatory for Personal Agents.</p>
            </div>
            <AiVerification country={selectedCountry} onVerified={handleAgentVerified} />
         </div>
      ) : (
        <div className="glass-panel-premium p-8 sm:p-12 rounded-3xl w-full max-w-[480px] shadow-2xl relative z-10 animate-fade-in border-t border-gold-500/20">
          
          <div className="text-center mb-10">
            <h2 className="text-6xl font-serif text-white italic tracking-tighter text-gradient-gold drop-shadow-lg relative inline-block">
              Sg16
              <span className="absolute -top-2 -right-6 text-xl text-gold-500/80 font-sans not-italic">™</span>
            </h2>
            <span className="not-italic font-medium text-gold-200/60 text-xs tracking-[0.5em] uppercase block mt-3 font-sans border-t border-gold-600/20 pt-3 mx-10">Finance</span>
            
            <div className="h-px w-8 bg-gold-600/40 mx-auto my-6"></div>
            <p className="text-gold-600 text-[10px] tracking-[0.2em] uppercase font-bold">Pan-Asian Capital Network</p>
          </div>

          {view !== 'OTP' && view !== 'SET_PASSWORD' && (
            <div className="mb-8 flex flex-col items-center gap-4">
              {/* Enhanced Node Selector */}
              <div className="relative group w-full">
                  <button className="w-full flex items-center justify-center gap-3 bg-black/40 hover:bg-gold-900/20 px-6 py-3 rounded-xl border border-gold-600/30 transition-all duration-500 group-hover:border-gold-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_8px_#B8860B]"></span>
                    <div className="flex flex-col items-start">
                       <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Region</span>
                       <span className="text-sm text-gold-200 font-mono tracking-widest uppercase flex items-center gap-2">
                         <span className="text-xl leading-none">{COUNTRIES[selectedCountry].flag}</span>
                         {COUNTRIES[selectedCountry].name} ({selectedCountry})
                       </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  <div className="absolute top-full mt-2 left-0 right-0 bg-luxury-900/95 backdrop-blur-xl border border-gold-600/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden max-h-80 overflow-y-auto custom-scrollbar p-2">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-4 py-2 border-b border-white/5">Southeast Asia</div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {['SG', 'MY', 'TH', 'ID', 'VN', 'PH'].map((code) => (
                        <div 
                          key={code} 
                          onClick={() => setSelectedCountry(code as CountryCode)}
                          className={`px-3 py-2 text-xs cursor-pointer rounded-lg transition-colors flex items-center gap-2 ${selectedCountry === code ? 'bg-gold-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                           <span className="text-lg">{COUNTRIES[code as CountryCode].flag}</span>
                           <span>{COUNTRIES[code as CountryCode].name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-4 py-2 border-b border-white/5 mt-2">South Asia</div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {['IN', 'PK', 'BD', 'LK', 'NP'].map((code) => (
                        <div 
                          key={code} 
                          onClick={() => setSelectedCountry(code as CountryCode)}
                          className={`px-3 py-2 text-xs cursor-pointer rounded-lg transition-colors flex items-center gap-2 ${selectedCountry === code ? 'bg-gold-500 text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                           <span className="text-lg">{COUNTRIES[code as CountryCode].flag}</span>
                           <span>{COUNTRIES[code as CountryCode].name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          )}

          {view === 'LOGIN' && (
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <div className="relative group">
                    <span className="absolute left-4 top-4 text-gold-500 text-sm font-mono border-r border-gold-600/30 pr-3 transition-colors">{countryConfig.phonePrefix}</span>
                    <input 
                      type="text" 
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 pl-16 focus:border-gold-500/50 focus:bg-black/60 focus:outline-none transition-all text-sm placeholder-gray-600 font-mono tracking-wide"
                      placeholder="SECURE ID"
                    />
                  </div>
                </div>
                <div>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:bg-black/60 focus:outline-none transition-all text-sm placeholder-gray-600 font-mono tracking-wide"
                    placeholder="ACCESS KEY"
                  />
                </div>
                
                <button type="submit" className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl transition-all hover:brightness-110 hover:scale-[1.02] shadow-[0_0_20px_rgba(184,134,11,0.2)] text-xs tracking-[0.2em] uppercase mt-4 border border-gold-400/50">
                  Authenticate
                </button>
              </form>

              <div className="pt-6 border-t border-gold-600/10">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleSocialLogin} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/5 transition-all text-xs font-medium">
                      <span className="text-xl">G</span> Google
                    </button>
                    <button onClick={handleSocialLogin} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/5 transition-all text-xs font-medium">
                      <span className="text-xl"></span> Apple
                    </button>
                </div>
              </div>

              <p className="text-center text-gray-600 text-xs mt-6">
                <button type="button" onClick={() => setView('SIGNUP')} className="text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-widest text-[10px] border-b border-transparent hover:border-gold-500">Apply for Membership</button>
              </p>
            </div>
          )}

          {view === 'SIGNUP' && (
            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* ROLE SELECTOR */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-1 bg-black/40 rounded-xl border border-white/5">
                {[
                  { id: 'BORROWER', label: 'Borrower' },
                  { id: 'AGENT_PERSONAL', label: 'Freelance' },
                  { id: 'AGENT_COMPANY', label: 'Corporate' }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    className={`py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all ${selectedRole === role.id ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                    placeholder="FULL NAME"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    required
                    value={formData.ic}
                    onChange={e => setFormData({...formData, ic: e.target.value})}
                    className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                    placeholder={`${countryConfig.idName.toUpperCase()} NUMBER`}
                  />
                </div>
                <div className="relative">
                    <span className="absolute left-4 top-4 text-gold-500 text-sm font-mono border-r border-gold-600/30 pr-3">{countryConfig.phonePrefix}</span>
                    <input 
                      type="tel" 
                      required
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 pl-16 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                      placeholder="MOBILE NUMBER"
                    />
                </div>

                {/* Corporate Agent Specific Fields */}
                {selectedRole === 'AGENT_COMPANY' && (
                  <div className="pt-4 border-t border-white/5 space-y-4">
                     <div className="text-gold-500 text-xs uppercase tracking-widest font-bold mb-2">Company Details</div>
                     <input 
                      type="text" 
                      required
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                      placeholder="COMPANY REG. NAME"
                    />
                    <input 
                      type="text" 
                      required
                      value={formData.companyRegNo}
                      onChange={e => setFormData({...formData, companyRegNo: e.target.value})}
                      className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                      placeholder="REGISTRATION NO. (SSM/DBD/NIB)"
                    />
                    <textarea 
                      required
                      value={formData.companyAddress}
                      onChange={e => setFormData({...formData, companyAddress: e.target.value})}
                      className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono h-20"
                      placeholder="REGISTERED ADDRESS"
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all hover:bg-gray-200 shadow-lg text-xs tracking-[0.2em] uppercase mt-4">
                {selectedRole === 'AGENT_PERSONAL' ? 'Proceed to Biometrics' : 'Initiate Verification'}
              </button>
              
              <p className="text-center mt-6">
                <button type="button" onClick={() => setView('LOGIN')} className="text-gray-500 hover:text-white text-[10px] uppercase tracking-widest">Return to Login</button>
              </p>
            </form>
          )}

          {view === 'OTP' && (
            <form onSubmit={handleOtpVerify} className="space-y-8 py-4">
              <div className="text-center">
                <p className="text-gold-500 text-xs mb-8 uppercase tracking-widest">Encrypted Code Sent</p>
                <input 
                  type="text" 
                  placeholder="000000"
                  value={formData.otp}
                  onChange={e => setFormData({...formData, otp: e.target.value})}
                  className="w-full bg-transparent border-b border-gold-600/50 text-gold-400 text-center text-4xl tracking-[1rem] p-4 focus:border-gold-500 focus:outline-none font-mono placeholder-gray-800"
                  maxLength={6}
                />
              </div>
              <button type="submit" className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] text-xs tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(184,134,11,0.2)]">
                Verify Link
              </button>
            </form>
          )}

          {view === 'SET_PASSWORD' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-white text-lg font-serif italic">Secure Your Account</h3>
                <p className="text-gray-500 text-xs mt-1">
                  {selectedRole === 'AGENT_PERSONAL' ? 'Next: Live AI Face Scan' : 'Final Step'}
                </p>
              </div>
              <div>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                  placeholder="CREATE ACCESS KEY"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-luxury-950/50 border border-gold-900/50 text-white rounded-xl p-4 focus:border-gold-500/50 focus:outline-none text-sm placeholder-gray-600 font-mono"
                  placeholder="CONFIRM KEY"
                />
              </div>
              <button type="submit" className="w-full bg-green-900/80 text-green-100 border border-green-500/30 font-bold py-4 rounded-xl transition-all hover:bg-green-800 hover:border-green-500 text-xs tracking-[0.2em] uppercase mt-4">
                {selectedRole === 'AGENT_PERSONAL' ? 'Scan Face' : 'Finalize Enrollment'}
              </button>
            </form>
          )}
        </div>
      )}
      
      <div className="absolute bottom-6 text-[9px] text-gray-800 uppercase tracking-[0.4em] font-mono z-10">
         Secure Connection • Sg16 Protocol v2.5
      </div>
    </div>
  );
};