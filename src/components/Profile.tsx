import React, { useRef, useState } from 'react';
import { UserProfile } from '../../types';
import { 
  Settings, 
  TrendingUp, 
  History, 
  Info, 
  Activity, 
  Camera, 
  Edit2, 
  Save, 
  X 
} from 'lucide-react';
import GeneticVulnerabilityEditor from './GeneticVulnerabilityEditor';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdateProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAge, setEditAge] = useState(profile.age);

  const defaultAvatar = `https://picsum.photos/seed/${profile.name}/200/200`;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateProfile({ ...profile, avatarUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: editName,
      age: editAge
    });
    setIsEditing(false);
  };

  const updateVulnerability = (updatedHistory: string[]) => {
    onUpdateProfile({
      ...profile,
      familyHistory: updatedHistory
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Profile Card */}
      <div className="flex items-center gap-6 mb-8 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative group">
          <div 
            className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <img 
              src={profile.avatarUrl || defaultAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera size={24} className="text-white" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange} 
          />
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold text-lg text-[#1F4D54] focus:ring-2 focus:ring-[#3498DB] outline-none"
              />
              <input 
                type="number" 
                value={editAge}
                onChange={(e) => setEditAge(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1 border rounded-xl text-sm font-bold text-slate-700 outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} className="bg-[#1F4D54] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                  <Save size={12} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1F4D54] leading-tight">{profile.name}</h2>
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-[#3498DB]">
                  <Edit2 size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-sm font-medium">Chronological Age: <span className="text-slate-900 font-bold">{profile.age}</span></p>
                <div className="flex items-center gap-1 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100">
                  <Activity size={10} className="text-[#3498DB]" />
                  <span className="text-[#3498DB] text-[10px] font-bold uppercase tracking-tighter">Bio-Age: {profile.age - 2}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STANDALONE COMPONENT */}
        <GeneticVulnerabilityEditor 
          selected={profile.familyHistory} 
          onChange={updateVulnerability} 
        />

        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
            <TrendingUp size={12} className="text-[#3498DB]" />
            Active Goals
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((g, idx) => (
              <span key={idx} className="text-[10px] font-bold bg-blue-50 text-[#3498DB] px-3 py-1.5 rounded-full uppercase tracking-tighter border border-blue-100">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1F4D54] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-display">Bio-Engine Configuration</h3>
            <Settings size={20} className="opacity-50" />
          </div>
          <p className="text-emerald-100 text-sm leading-relaxed opacity-80 font-medium">
            Your biological profile is calibrated to your chronological age of <strong>{profile.age}</strong>. 
            All metabolic protocols utilize <strong>{profile.cuisinePreference}</strong> cuisine as the primary delivery mechanism for longevity nutrients.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-2 rounded-xl border border-white/10 tracking-widest uppercase">
            <Info size={14} className="text-[#8CC63F]" />
            Clinical Protocol v2.5.0 Active
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#8CC63F]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Integrations */}
      <div className="space-y-4 pt-4">
        <h3 className="font-bold text-[#1F4D54] flex items-center gap-2 px-1 uppercase text-xs tracking-widest">
          Bio-Sensing Integrations
        </h3>
        <div className="space-y-2">
          {[
            { label: 'CGM Bio-Link', active: false, icon: History },
            { label: 'DNA Sequencing Blueprint', active: false, icon: History },
            { label: 'Wearable Sync (HRV/Sleep)', active: false, icon: History },
          ].map((item, idx) => (
            <button key={idx} className="w-full bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-[#3498DB] transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${item.active ? 'bg-blue-50 text-[#3498DB]' : 'bg-slate-50 text-slate-300'}`}>
                  <item.icon size={18} />
                </div>
                <span className={`font-bold text-sm ${item.active ? 'text-[#1F4D54]' : 'text-slate-400'}`}>{item.label}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${item.active ? 'text-[#8CC63F]' : 'text-slate-300'}`}>
                {item.active ? 'Syncing' : 'Coming Soon ...'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;