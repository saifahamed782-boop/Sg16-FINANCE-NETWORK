import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VerificationStep, VerificationResult, CountryCode } from '../types';
import { verifyIdentityWithAI } from '../services/geminiService';

interface AiVerificationProps {
  country: CountryCode;
  onVerified?: (result: VerificationResult) => void;
}

export const AiVerification: React.FC<AiVerificationProps> = ({ country, onVerified }) => {
  const [step, setStep] = useState<VerificationStep>(VerificationStep.ID_UPLOAD);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [deviceContext, setDeviceContext] = useState('');
  
  // Auto-Capture State
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
     setDeviceContext(`UserAgent: ${navigator.userAgent} | Screen: ${window.screen.width}x${window.screen.height}`);
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const pureBase64 = base64String.split(',')[1];
        resolve(pureBase64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setIdImage(base64);
      setStep(VerificationStep.SELFIE_CAPTURE);
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Start Auto-Capture Sequence
        startAutoCaptureSequence();
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera permission required for Biometric Verification.");
    }
  };

  const startAutoCaptureSequence = () => {
    // Wait 1s for camera to settle, then 3s countdown
    setTimeout(() => setCountdown(3), 1000);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => (c as number) - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      captureSelfie();
      setCountdown(null);
    }
  }, [countdown]);

  const captureSelfie = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const pureBase64 = dataUrl.split(',')[1];
        
        setSelfieImage(pureBase64);
        
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());

        processVerification(pureBase64);
      }
    }
  }, [idImage, country]);

  const processVerification = async (currentSelfie: string) => {
    if (!idImage) return;
    setStep(VerificationStep.ANALYZING);
    
    // AI Verification with Country Context
    const aiResult = await verifyIdentityWithAI(idImage, currentSelfie, country, deviceContext);
    setResult(aiResult);
    setStep(VerificationStep.RESULT);

    if (aiResult.isMatch && onVerified) {
      onVerified(aiResult);
    }
  };

  const reset = () => {
    setStep(VerificationStep.ID_UPLOAD);
    setIdImage(null);
    setSelfieImage(null);
    setResult(null);
    setCountdown(null);
  };

  return (
    <div className="bg-tech-900 border border-tech-700 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
          <div className="flex items-center">
             <svg className="w-5 h-5 mr-2 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
             AI Biometric Verification
          </div>
          {step === VerificationStep.SELFIE_CAPTURE && (
             <span className="text-[10px] bg-red-900/50 text-red-500 px-2 py-1 rounded animate-pulse border border-red-500/30 font-bold tracking-widest">LIVE UPLINK</span>
          )}
        </h3>
        <p className="text-gray-400 text-xs mb-6 font-mono tracking-wide uppercase">
          {country} National Database Protocol • Face Match v4.0
        </p>

        {step === VerificationStep.ID_UPLOAD && (
          <div className="border-2 border-dashed border-tech-700 hover:border-gold-500 transition-colors rounded-lg p-10 text-center group bg-black/40 relative overflow-hidden">
             {/* Scanning Line Animation */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gold-500/50 blur-sm animate-scan opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleIdUpload} 
              className="hidden" 
              id="id-upload"
            />
            <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center relative z-10">
              <div className="w-20 h-20 mb-4 rounded-full bg-tech-800 group-hover:bg-gold-500/20 flex items-center justify-center transition-all border border-white/10 group-hover:border-gold-500">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </div>
              <span className="text-white font-bold tracking-widest text-sm uppercase">Upload Identity Card</span>
              <span className="text-xs text-gray-500 mt-2 font-mono">MyKad / Thai ID / KTP</span>
            </label>
          </div>
        )}

        {step === VerificationStep.SELFIE_CAPTURE && (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3] border border-gold-600/30 shadow-[0_0_30px_rgba(184,134,11,0.1)]">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 mix-blend-lighten"></video>
             <canvas ref={canvasRef} className="hidden"></canvas>
             
             {/* Biometric HUD Overlay */}
             <div className="absolute inset-0 pointer-events-none">
                {/* Tech Grid Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-white/5"></div>
                
                {/* Central Focus Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-gold-500/30 rounded-full animate-pulse-slow">
                   <div className="absolute inset-0 border-t border-b border-gold-500/60 rounded-full animate-spin-slow"></div>
                   <div className="absolute -inset-4 border-l border-r border-white/20 rounded-full"></div>
                </div>

                {/* Face Frame */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-gold-500/50 rounded-[3rem] shadow-[0_0_20px_rgba(184,134,11,0.2)]">
                   {/* Scanning Bar */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-gold-400 shadow-[0_0_15px_#FACC15] animate-scan opacity-80"></div>
                   
                   {/* Corner Markers */}
                   <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-gold-500"></div>
                   <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-gold-500"></div>
                   <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-gold-500"></div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-gold-500"></div>
                </div>
                
                {/* Data Points HUD */}
                <div className="absolute top-4 left-4 text-[9px] text-green-400 font-mono space-y-1 leading-tight">
                   <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> AI VISION ACTIVE</div>
                   <div>ISO: AUTO-ADJUST</div>
                   <div>EXPOSURE: +0.02</div>
                   <div>DEPTH MAP: GENERATING...</div>
                </div>

                 <div className="absolute top-4 right-4 text-[9px] text-gold-500 font-mono text-right">
                   <div>SECURE ID PROTOCOL</div>
                   <div>{country}-NODE-442</div>
                </div>
             </div>

             {/* Countdown Overlay */}
             {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                   <div className="relative">
                      <div className="text-9xl font-bold text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-ping font-mono">
                         {countdown}
                      </div>
                      <div className="absolute inset-0 border-4 border-gold-500 rounded-full animate-ping opacity-30"></div>
                   </div>
                </div>
             )}

             <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
               {countdown === 0 || countdown === null ? (
                   <button 
                    onClick={captureSelfie}
                    className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md group"
                   >
                     <div className="w-12 h-12 bg-white rounded-full group-hover:scale-90 transition-transform"></div>
                   </button>
               ) : (
                   <div className="text-[10px] text-black font-bold tracking-[0.2em] font-mono bg-gold-500 px-4 py-1.5 rounded-full shadow-[0_0_15px_#B8860B] animate-pulse">AUTO-CAPTURE ENGAGED</div>
               )}
             </div>
          </div>
        )}

        {step === VerificationStep.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gold-600/5 animate-pulse"></div>
            <div className="relative w-32 h-32 mb-6">
              <svg className="absolute inset-0 w-full h-full text-tech-700 animate-spin-slow opacity-30" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
              <div className="absolute inset-2 border-2 border-gold-500/50 rounded-full animate-ping"></div>
              <div className="absolute inset-8 bg-tech-900 rounded-full flex items-center justify-center border border-white/10 z-10">
                <span className="text-3xl animate-bounce">🧬</span>
              </div>
            </div>
            <h4 className="text-xl font-bold text-white tracking-widest uppercase">Biometric Match</h4>
            <div className="w-48 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden relative">
               <div className="absolute inset-0 bg-gold-500 animate-loading-bar"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-wider">Comparing 128 Facial Landmarks...</p>
          </div>
        )}

        {step === VerificationStep.RESULT && result && (
          <div className={`p-6 rounded-lg border relative overflow-hidden ${result.isMatch ? 'border-green-500/50 bg-green-950/20' : 'border-red-500/50 bg-red-950/20'}`}>
            {result.isMatch && <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>}
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-xs font-mono uppercase text-gray-400 tracking-widest">Match Probability</span>
              <span className={`text-3xl font-bold ${result.isMatch ? 'text-green-400' : 'text-red-400'}`}>
                {result.confidence}%
              </span>
            </div>
            
            <div className="space-y-3 mb-6 relative z-10 border-t border-white/5 pt-4">
              <div className="flex justify-between text-sm">
                 <span className="text-gray-500">ID Classification</span>
                 <span className="text-white font-mono">{result.idType || 'UNIDENTIFIED'}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Name Extracted</span>
                 <span className="text-white font-bold">{result.extractedName || 'N/A'}</span>
              </div>
              <div className="mt-2 bg-black/30 p-3 rounded text-xs italic text-gray-400 border border-white/5">
                Analyzed: "{result.reason}"
              </div>
            </div>

            {result.isMatch ? (
               <div className="w-full py-4 bg-green-600 hover:bg-green-500 text-white text-center font-bold rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Identity Confirmed
               </div>
            ) : (
              <button onClick={reset} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg transition-all uppercase tracking-widest text-xs">
                Retry Biometrics
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .animate-loading-bar {
           animation: loading 2s ease-in-out infinite;
           width: 50%;
        }
        @keyframes loading {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};