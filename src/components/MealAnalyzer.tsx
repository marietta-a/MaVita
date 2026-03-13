import React, { useState, useRef } from 'react';
import { Camera as CameraIcon, AlertCircle, ArrowRight, Activity, Utensils, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { analyzeMealImage } from '../services/gemini';
import { MealAnalysis, UserProfile } from '../../types';

// 1. Import Capacitor Camera
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface MealAnalyzerProps {
  profile: UserProfile;
  onAnalysisComplete: (analysis: MealAnalysis) => void;
}

const MealAnalyzer: React.FC<MealAnalyzerProps> = ({ profile, onAnalysisComplete }) => {
  const [mode, setMode] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing Bio-Engine...');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusMessages = [
    'Isolating Molecular Compounds...',
    'Quantifying Glycemic Impact...',
    'Mapping Inflammatory Pathways...',
    'Sequencing Nutrient Density...',
    'Finalizing Clinical Data...'
  ];

  /**
   * NATIVE CAMERA CAPTURE
   * Replaces the old startCamera (getUserMedia) logic
   */
  const startNativeCapture = async () => {
    try {
      setError(null);
      
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera, // Force native camera
        saveToGallery: false
      });

      if (image.base64String) {
        const fullDataUrl = `data:image/${image.format};base64,${image.base64String}`;
        await runAnalysisCycle(fullDataUrl);
      }
    } catch (err: any) {
      // Handle user cancellation or permission denial
      if (err.message !== "User cancelled photos app") {
        setError("Camera access required for Bio-Scanning. Please check app permissions.");
      }
    }
  };

  /**
   * IMAGE OPTIMIZATION
   * Ensures the payload is small enough for fast transmission over mobile networks
   */
  const optimizeImage = (base64: string, maxWidth = 768): Promise<{data: string, url: string}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxWidth) { width *= maxWidth / height; height = maxWidth; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve({ data: dataUrl.split(',')[1], url: dataUrl });
        } else {
          resolve({ data: base64.split(',')[1], url: base64 });
        }
      };
      img.src = base64;
    });
  };

  const runAnalysisCycle = async (fullDataUrl: string) => {
    setMode('analyzing');
    setError(null);
    setStatusMessage("Pre-processing for High Accuracy...");

    try {
      const optimized = await optimizeImage(fullDataUrl);
      setPreview(optimized.url);
      
      let msgIdx = 0;
      const statusInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % statusMessages.length;
        setStatusMessage(statusMessages[msgIdx]);
      }, 1200);

      // Trigger the backend API call via apiService/gemini service
      const result = await analyzeMealImage(optimized.data, 'image/jpeg', profile);
      
      clearInterval(statusInterval);

      if (!result.isFood) {
        throw new Error("Scan Failure: Non-consumable item detected. Please scan food.");
      }

      setAnalysis(result);
      setMode('result');

    } catch (err: any) {
      setError(err.message || "Precision Analysis Error. Please try again.");
      setMode('idle');
    }
  };

  const handleGalleryUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      // Use native photo picker for better UX on mobile
      try {
        const image = await Camera.getPhoto({
          quality: 80,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos
        });
        if (image.base64String) {
          await runAnalysisCycle(`data:image/${image.format};base64,${image.base64String}`);
        }
      } catch (e) { console.log("Gallery cancelled"); }
    } else {
      // Fallback for web testing
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await runAnalysisCycle(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- RENDERING LOGIC (UI stays consistent with MaVita design) ---

  if (mode === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-white animate-in fade-in">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative">
          <Activity className="w-12 h-12 text-[#3498DB] animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-[#8CC63F]/30 border-t-[#8CC63F] animate-spin" />
        </div>
        <div className="space-y-6 w-full max-w-xs">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1F4D54] font-display">MaVita Bio-Scan</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-[#8CC63F]" />
              High-Precision Mode
            </p>
          </div>
          <p className="text-[#3498DB] font-bold text-sm h-8 animate-pulse transition-all">{statusMessage}</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3498DB] to-[#8CC63F] w-2/3 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result' && analysis && preview) {
    return (
      <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-6">
        <div className="relative group">
          <img src={preview} alt="Analyzed meal" className="w-full h-64 object-cover rounded-[2.5rem] shadow-xl border-4 border-white" />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-100">
             <div className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
             <span className="text-[10px] font-bold text-[#1F4D54] uppercase tracking-wider">Clinical Map Generated</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-[#1F4D54] font-display leading-tight">{analysis.foodName}</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">{analysis.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 text-center shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Metabolic Load</p>
            <div className={`text-4xl font-bold ${analysis.glycemicScore > 7 ? 'text-rose-500' : 'text-[#3498DB]'}`}>
              {analysis.glycemicScore}
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Glycemic Units</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 text-center shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cellular Stress</p>
            <div className="text-4xl font-bold text-[#1F4D54]">
              {analysis.iIndexScore}
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Inflamm-Index</p>
          </div>
        </div>

        <div className="bg-[#1F4D54] p-6 rounded-[2rem] text-white">
          <h3 className="text-xs font-bold text-[#8CC63F] flex items-center gap-2 mb-4 uppercase tracking-widest">
            <Utensils size={14} /> Molecular Nutrient Density
          </h3>
          <div className="space-y-3">
            {analysis.nutrients.map((n, idx) => (
              <div key={idx} className="flex flex-col gap-1 text-xs bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="font-bold text-white">{n.name}</span>
                <span className="opacity-70 font-medium">{n.benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            onClick={() => { setMode('idle'); setAnalysis(null); setPreview(null); }}
            className="flex-1 bg-slate-100 py-6 rounded-3xl font-bold text-slate-500 active:scale-95 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={() => onAnalysisComplete({ ...analysis, imageUrl: preview })}
            className="flex-[2] bg-[#1F4D54] text-white py-6 rounded-3xl font-bold shadow-2xl shadow-teal-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Store Bio-Data <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 flex flex-col items-center justify-center min-h-[75vh] animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#1F4D54] font-display tracking-tight">Bio-Scanner</h2>
        <p className="text-slate-500 max-w-[300px] mx-auto text-sm font-medium leading-relaxed">
          Predict your physiological response with high-fidelity metabolic analysis.
        </p>
      </div>

      <div 
        onClick={handleGalleryUpload}
        className="w-full aspect-square max-w-[280px] rounded-[3rem] border-4 border-dashed border-[#8CC63F]/40 bg-emerald-50/30 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-emerald-50 hover:border-[#8CC63F] transition-all relative group"
      >
        <div className="w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <CameraIcon size={44} className="text-[#3498DB]" />
        </div>
        <p className="text-[#1F4D54] font-bold text-xs tracking-[0.3em] uppercase">Initialize Scan</p>
      </div>

      <div className="w-full max-w-[280px] space-y-3">
        <button 
           onClick={startNativeCapture}
           className="w-full bg-[#1F4D54] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-teal-100"
        >
          <CameraIcon size={20} /> Live Optics Mode
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-rose-600 flex items-start gap-3 animate-in shake">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Hidden input for web fallback */}
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileInputChange} className="hidden" />
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(150%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default MealAnalyzer;