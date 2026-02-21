import React from 'react';
import { Download, Sparkles, X, ShieldCheck, Zap } from 'lucide-react';

interface UpdatePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  version?: string;
  forceUpdate?: boolean;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  version = "2.0.0",
  forceUpdate = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={!forceUpdate ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Header Graphic */}
        <div className="bg-[#1F4D54] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8CC63F]/20 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#3498DB]/20 rounded-full blur-xl -ml-10 -mb-10" />
          
          <div className="relative z-10 mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-4 shadow-lg">
            <Sparkles className="text-[#8CC63F]" size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Bio-Engine Upgrade</h2>
          <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest">Version {version} Available</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 rounded-full mt-0.5">
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Enhanced Algorithm</h4>
                <p className="text-xs text-slate-500">Improved metabolic scoring precision.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-50 rounded-full mt-0.5">
                <Zap size={16} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Performance Boost</h4>
                <p className="text-xs text-slate-500">Faster image analysis and syncing.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={onUpdate}
              className="w-full bg-[#1F4D54] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-teal-900/10 active:scale-[0.98] transition-all hover:bg-[#163B41]"
            >
              <Download size={20} />
              Update Now
            </button>
            
            {!forceUpdate && (
              <button 
                onClick={onClose}
                className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Remind Me Later
              </button>
            )}
          </div>
        </div>

        {/* Close Button (only if not forced) */}
        {!forceUpdate && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 text-white/70 rounded-full hover:bg-black/30 backdrop-blur-md transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdatePrompt;