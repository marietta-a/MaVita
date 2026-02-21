
import React, { useState, useEffect } from 'react';
import { UserProfile, MealAnalysis } from '../types';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import MealAnalyzer from './components/MealAnalyzer';
import PlateBuilder from './components/PlateBuilder';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mealHistory, setMealHistory] = useState<MealAnalysis[]>([]);
  const [bioReport, setBioReport] = useState<string | null>(null);

  useEffect(() => {
    // Migrated storage keys to 'mavita' to ensure fresh data and brand consistency
    const savedProfile = localStorage.getItem('mavita_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    const savedHistory = localStorage.getItem('mavita_history');
    if (savedHistory) {
      setMealHistory(JSON.parse(savedHistory));
    }
    const savedReport = localStorage.getItem('mavita_cached_report');
    if (savedReport) {
      setBioReport(savedReport);
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('mavita_profile', JSON.stringify(newProfile));
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('mavita_profile', JSON.stringify(updatedProfile));
  };

  const handleMealLogged = (analysis: MealAnalysis) => {
    const updatedHistory = [analysis, ...mealHistory];
    setMealHistory(updatedHistory);
    localStorage.setItem('mavita_history', JSON.stringify(updatedHistory));
    
    // Invalidate cached report when a new meal is logged
    setBioReport(null);
    localStorage.removeItem('mavita_cached_report');
    
    setActiveTab('dashboard');
  };

  const handleDeleteMeal = (mealId: string) => {
    const updatedHistory = mealHistory.filter(m => m.id !== mealId);
    setMealHistory(updatedHistory);
    localStorage.setItem('mavita_history', JSON.stringify(updatedHistory));
    
    // Also invalidate report if data changes significantly
    setBioReport(null);
    localStorage.removeItem('mavita_cached_report');
  };

  const handleUpdateMeal = (updatedMeal: MealAnalysis) => {
    const updatedHistory = mealHistory.map(m => m.id === updatedMeal.id ? updatedMeal : m);
    setMealHistory(updatedHistory);
    localStorage.setItem('mavita_history', JSON.stringify(updatedHistory));
    
    setBioReport(null);
    localStorage.removeItem('mavita_cached_report');
  };

  const handleReportGenerated = (report: string) => {
    setBioReport(report);
    localStorage.setItem('mavita_cached_report', report);
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          profile={profile} 
          mealHistory={mealHistory} 
          onDeleteMeal={handleDeleteMeal}
          onUpdateMeal={handleUpdateMeal}
          cachedReport={bioReport}
          onReportGenerated={handleReportGenerated}
        />
      )}
      {activeTab === 'scan' && <MealAnalyzer profile={profile} onAnalysisComplete={handleMealLogged} />}
      {activeTab === 'builder' && (
        <PlateBuilder 
          profile={profile} 
          onUpdateProfile={handleUpdateProfile}
        />
      )}
      {activeTab === 'profile' && (
        <Profile 
          profile={profile} 
          onUpdateProfile={handleUpdateProfile} 
        />
      )}
    </Layout>
  );
};

export default App;
