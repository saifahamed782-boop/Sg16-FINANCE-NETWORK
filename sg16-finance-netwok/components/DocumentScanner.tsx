import React, { useState, useEffect } from 'react';
import { analyzeLoanDocument } from '../services/geminiService';
import { DocumentAnalysisResult, CountryCode } from '../types';

interface DocumentScannerProps {
  country: CountryCode;
  onAnalyzeComplete?: (result: DocumentAnalysisResult) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ country, onAnalyzeComplete }) => {
  const [file, setFile] = useState<string | null>(null);
  const [deviceInfoString, setDeviceInfoString] = useState<string>('');
  const [deviceDetails, setDeviceDetails] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    let browserName = "Unknown Browser";
    if (ua.includes("Firefox")) browserName = "Mozilla Firefox";
    else if (ua.includes("SamsungBrowser")) browserName = "Samsung Internet";
    else if (ua.includes("Chrome")) browserName = "Google Chrome";
    else if (ua.includes("Safari")) browserName = "Apple Safari";

    const nav = navigator as any;
    const details: Record<string, string> = {
      "IP_REGION_GUESS": country,
      "BROWSER": browserName,
      "OS": navigator.platform,
      "RES": `${window.screen.width}x${window.screen.height}`,
      "RAM": nav.deviceMemory ? `${nav.deviceMemory}GB` : "N/A",
      "LANG": navigator.language
    };

    setDeviceDetails(details);
    setDeviceInfoString(Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(' | '));
  }, [country]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setFile(base64);
        setIsAnalyzing(true);
        setResult(null);
        
        const analysis = await analyzeLoanDocument(base64, deviceInfoString, country);
        setResult(analysis);
        setIsAnalyzing(false);

        if (onAnalyzeComplete) {
          onAnalyzeComplete(analysis);
        }
      };
      
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="bg-tech-900 border border-tech-700 rounded-xl overflow-hidden shadow-2xl relative h-full flex flex-col">
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full"></div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Financial Document AI
        </h3>
        
        <div className="mb-6 bg-black rounded-lg p-3 font-mono text-[10px] text-green-500 overflow-hidden border border-gray-800 shadow-inner relative group h-24 overflow-y-auto">
          {Object.entries(deviceDetails).map(([key, value]) => (
            <div key={key} className="flex border-b border-gray-900/50 pb-0.5 last:border-0">
              <span className="text-gray-500 w-24 shrink-0 uppercase opacity-70">[{key}]</span>
              <span className="text-green-400/90">{value}</span>
            </div>
          ))}
        </div>

        {!file && (
          <div className="flex-1 flex flex-col justify-center">
            <label className="border-2 border-dashed border-tech-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all rounded-lg p-8 text-center cursor-pointer group bg-tech-900/50 relative overflow-hidden">
              <div className="relative z-10">
                <input type="file" onChange={handleUpload} className="hidden" accept="image/*" />
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tech-800 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <span className="text-base text-gray-200 font-bold block mb-1">Upload Bank Statement / Payslip</span>
                <span className="text-xs text-gray-500">Supports PDF, JPG, PNG</span>
              </div>
            </label>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-xs text-blue-400 font-mono animate-pulse">Analyzing financial patterns...</p>
          </div>
        )}

        {result && !isAnalyzing && (
          <div className="bg-tech-900/80 rounded-lg p-5 border border-tech-700 text-sm space-y-4 animate-fade-in shadow-inner">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Doc Type</span>
              <span className="font-mono text-white bg-gray-800 px-2 py-0.5 rounded">{result.documentType}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <span className="text-xs text-gray-500 block mb-1">Income Detected</span>
                  <span className="font-bold text-gold-500 text-lg">{result.extractedIncome.toLocaleString()}</span>
               </div>
               <div>
                  <span className="text-xs text-gray-500 block mb-1">Source</span>
                  <span className="font-bold text-white text-sm truncate block" title={result.employerName}>{result.employerName}</span>
               </div>
            </div>

            <div className="bg-black/30 p-3 rounded border border-gray-800">
               <div className="flex justify-between text-xs mb-2">
                 <span className="text-gray-500 uppercase font-bold">Trust Score</span>
                 <span className={`font-mono font-bold ${result.fraudRiskScore > 50 ? 'text-red-500' : 'text-green-500'}`}>{100 - result.fraudRiskScore}/100</span>
               </div>
               <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                 <div 
                   className={`h-full transition-all duration-1000 ${result.fraudRiskScore > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                   style={{ width: `${100 - result.fraudRiskScore}%` }}
                 ></div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};