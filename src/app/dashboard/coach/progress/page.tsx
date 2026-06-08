'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Search, 
  User, 
  ChevronDown, 
  Plus, 
  Camera, 
  ChevronRight, 
  Activity, 
  Scale, 
  Maximize2,
  AlertCircle,
  X,
  Award,
  Trash2,
  ArrowDown,
  ArrowUp,
  Upload
} from 'lucide-react';

interface ProgressPhoto {
  id: string;
  traineeId: string;
  week: string;
  date: string;
  imageUrl: string;
}

const defaultPhotos: ProgressPhoto[] = [];
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Trainee {
  id: string;
  name: string;
  goal: string;
  initialWeight: string;
  currentWeight: string;
}

import { useLanguage } from '@/store/useLanguage';
import { translations } from '@/lib/translations';

interface ProgressEntry {
  week: string;
  date: string; // YYYY-MM-DD for custom period filters
  weight: number;
  waist: number;
  chest: number;
  bodyFat: number;
}

const trainees: Trainee[] = [
  { id: '1', name: 'John Doe', goal: 'Fat Loss', initialWeight: '88 kg', currentWeight: '84.8 kg' },
  { id: '2', name: 'Sarah Jenkins', goal: 'Muscle Gain', initialWeight: '58 kg', currentWeight: '61.5 kg' },
  { id: '3', name: 'Mike Ross', goal: 'Strength Build', initialWeight: '75 kg', currentWeight: '76.8 kg' },
  { id: '4', name: 'Emma Wilson', goal: 'Fat Loss', initialWeight: '69 kg', currentWeight: '65.2 kg' },
];

const progressData: Record<string, ProgressEntry[]> = {
  '1': [
    { week: 'Week 1', date: '2026-05-01', weight: 88.0, waist: 96, chest: 104, bodyFat: 22 },
    { week: 'Week 2', date: '2026-05-08', weight: 87.2, waist: 95, chest: 104, bodyFat: 21.6 },
    { week: 'Week 3', date: '2026-05-15', weight: 86.5, waist: 93, chest: 103, bodyFat: 21 },
    { week: 'Week 4', date: '2026-05-22', weight: 85.8, waist: 92, chest: 102, bodyFat: 20.3 },
    { week: 'Week 5', date: '2026-05-29', weight: 84.8, waist: 90, chest: 102, bodyFat: 19.5 },
  ],
  '2': [
    { week: 'Week 1', date: '2026-05-01', weight: 58.0, waist: 66, chest: 84, bodyFat: 18 },
    { week: 'Week 2', date: '2026-05-08', weight: 59.1, waist: 66, chest: 84.5, bodyFat: 18.2 },
    { week: 'Week 3', date: '2026-05-15', weight: 60.2, waist: 67, chest: 85, bodyFat: 18.5 },
    { week: 'Week 4', date: '2026-05-22', weight: 60.8, waist: 67, chest: 85.5, bodyFat: 18.3 },
    { week: 'Week 5', date: '2026-05-29', weight: 61.5, waist: 67, chest: 86, bodyFat: 18.1 },
  ],
  '3': [
    { week: 'Week 1', date: '2026-05-01', weight: 75.0, waist: 82, chest: 98, bodyFat: 16 },
    { week: 'Week 2', date: '2026-05-08', weight: 75.3, waist: 82, chest: 98.5, bodyFat: 15.8 },
    { week: 'Week 3', date: '2026-05-15', weight: 75.8, waist: 81.5, chest: 99.2, bodyFat: 15.5 },
    { week: 'Week 4', date: '2026-05-22', weight: 76.2, waist: 81, chest: 100.1, bodyFat: 15.1 },
    { week: 'Week 5', date: '2026-05-29', weight: 76.8, waist: 81, chest: 100.8, bodyFat: 14.8 },
  ],
  '4': [
    { week: 'Week 1', date: '2026-05-01', weight: 69.0, waist: 80, chest: 92, bodyFat: 25 },
    { week: 'Week 2', date: '2026-05-08', weight: 68.1, waist: 79, chest: 91.5, bodyFat: 24.5 },
    { week: 'Week 3', date: '2026-05-15', weight: 67.2, waist: 78, chest: 91, bodyFat: 24 },
    { week: 'Week 4', date: '2026-05-22', weight: 66.4, waist: 77, chest: 90, bodyFat: 23.2 },
    { week: 'Week 5', date: '2026-05-29', weight: 65.2, waist: 75, chest: 89, bodyFat: 22.1 },
  ]
};

export default function ProgressReportsPage() {
  const { language } = useLanguage();
  const t = translations[language].progress;
  const [selectedTraineeId, setSelectedTraineeId] = useState('1');
  const [searchTraineeQuery, setSearchTraineeQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'weight' | 'measurements' | 'photos' | 'journey'>('weight');



  // Photos state
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadWeek, setUploadWeek] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox modal state
  const [lightboxPhoto, setLightboxPhoto] = useState<ProgressPhoto | null>(null);

  // Comparison selection state
  const [compareBeforeId, setCompareBeforeId] = useState('');
  const [compareAfterId, setCompareAfterId] = useState('');
  const [compareResult, setCompareResult] = useState<{
    before: ProgressPhoto;
    after: ProgressPhoto;
  } | null>(null);

  // Load photos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('coach_progress_photos');
    let loadedPhotos = defaultPhotos;
    if (stored) {
      try {
        loadedPhotos = JSON.parse(stored);
      } catch (e) {
        loadedPhotos = defaultPhotos;
      }
    } else {
      localStorage.setItem('coach_progress_photos', JSON.stringify(defaultPhotos));
    }
    setPhotos(loadedPhotos);
  }, []);

  const activeTraineePhotos = useMemo(() => {
    return photos.filter(p => p.traineeId === selectedTraineeId);
  }, [photos, selectedTraineeId]);

  // Sync comparison selections with active trainee photos
  useEffect(() => {
    if (activeTraineePhotos.length > 0) {
      setCompareBeforeId(activeTraineePhotos[activeTraineePhotos.length - 1].id);
      setCompareAfterId(activeTraineePhotos[0].id);
      setCompareResult(null);
    } else {
      setCompareBeforeId('');
      setCompareAfterId('');
      setCompareResult(null);
    }
  }, [activeTraineePhotos]);

  const handleUploadPhoto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile || !uploadWeek || !uploadDate) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newPhoto: ProgressPhoto = {
        id: `p_${Date.now()}`,
        traineeId: selectedTraineeId,
        week: uploadWeek,
        date: uploadDate,
        imageUrl: base64String
      };
      const updatedPhotos = [newPhoto, ...photos];
      setPhotos(updatedPhotos);
      localStorage.setItem('coach_progress_photos', JSON.stringify(updatedPhotos));
      
      // Reset upload state
      setUploadFile(null);
      setUploadWeek('');
      setUploadDate(new Date().toISOString().split('T')[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(uploadFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError('Please select a valid image file (png, jpeg, webp).');
        setUploadFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size must be less than 5MB.');
        setUploadFile(null);
        return;
      }
      setFileError('');
      setUploadFile(file);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm("Are you sure you want to delete this progress photo?")) {
      const updated = photos.filter(p => p.id !== photoId);
      setPhotos(updated);
      localStorage.setItem('coach_progress_photos', JSON.stringify(updated));
      if (compareResult?.before.id === photoId || compareResult?.after.id === photoId) {
        setCompareResult(null);
      }
    }
  };

  const handleCompare = () => {
    const beforePhoto = activeTraineePhotos.find(p => p.id === compareBeforeId);
    const afterPhoto = activeTraineePhotos.find(p => p.id === compareAfterId);
    if (beforePhoto && afterPhoto) {
      setCompareResult({
        before: beforePhoto,
        after: afterPhoto
      });
    }
  };

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter trainees based on search input query
  const filteredTrainees = useMemo(() => {
    return trainees.filter(t => 
      t.name.toLowerCase().includes(searchTraineeQuery.toLowerCase()) ||
      t.goal.toLowerCase().includes(searchTraineeQuery.toLowerCase())
    );
  }, [searchTraineeQuery]);

  // Retrieve active selected trainee
  const activeTrainee = useMemo(() => {
    return trainees.find(t => t.id === selectedTraineeId) || trainees[0];
  }, [selectedTraineeId]);

  // Load progress data for active trainee
  const selectedData = useMemo(() => {
    if (!activeTrainee) return [];
    return progressData[activeTrainee.id] || [];
  }, [activeTrainee]);

  // Filter progress logs based on specified date range
  const dateFilteredData = useMemo(() => {
    return selectedData;
  }, [selectedData]);

  const latestData = useMemo(() => {
    return dateFilteredData[dateFilteredData.length - 1] || { waist: 0, bodyFat: 0, weight: 0 };
  }, [dateFilteredData]);

  const statsBreakdown = useMemo(() => {
    if (dateFilteredData.length < 2) return { weightChange: '0.0', waistReduction: 0 };
    const first = dateFilteredData[0];
    const last = dateFilteredData[dateFilteredData.length - 1];
    return {
      weightChange: Math.abs(last.weight - first.weight).toFixed(1),
      waistReduction: first.waist - last.waist
    };
  }, [dateFilteredData]);

  // Calculate timeline progress logs dynamically
  const timelineEntries = useMemo(() => {
    if (!selectedData || selectedData.length === 0) return [];
    return selectedData.map((entry, index) => {
      const prevEntry = index > 0 ? selectedData[index - 1] : null;
      const startEntry = selectedData[0];

      const weightDiffPrev = prevEntry ? (entry.weight - prevEntry.weight) : 0;
      const waistDiffPrev = prevEntry ? (entry.waist - prevEntry.waist) : 0;
      const chestDiffPrev = prevEntry ? (entry.chest - prevEntry.chest) : 0;
      const fatDiffPrev = prevEntry ? (entry.bodyFat - prevEntry.bodyFat) : 0;

      const weightDiffStart = (entry.weight - startEntry.weight);
      const waistDiffStart = (entry.waist - startEntry.waist);
      const chestDiffStart = (entry.chest - startEntry.chest);
      const fatDiffStart = (entry.bodyFat - startEntry.bodyFat);

      // Find photo matching week or date
      const photo = activeTraineePhotos.find(p => p.week.toLowerCase() === entry.week.toLowerCase() || p.date === entry.date);

      return {
        ...entry,
        weightDiffPrev,
        waistDiffPrev,
        chestDiffPrev,
        fatDiffPrev,
        weightDiffStart,
        waistDiffStart,
        chestDiffStart,
        fatDiffStart,
        photo
      };
    });
  }, [selectedData, activeTraineePhotos]);

  // Compare result deltas
  const comparisonMetrics = useMemo(() => {
    if (!compareResult || !activeTrainee) return null;
    const traineeData = progressData[activeTrainee.id] || [];
    const beforeLog = traineeData.find(d => d.week === compareResult.before.week || d.date === compareResult.before.date);
    const afterLog = traineeData.find(d => d.week === compareResult.after.week || d.date === compareResult.after.date);

    if (beforeLog && afterLog) {
      return {
        beforeWeight: beforeLog.weight,
        afterWeight: afterLog.weight,
        weightDiff: (afterLog.weight - beforeLog.weight).toFixed(1),
        beforeWaist: beforeLog.waist,
        afterWaist: afterLog.waist,
        waistDiff: afterLog.waist - beforeLog.waist,
        beforeBodyFat: beforeLog.bodyFat,
        afterBodyFat: afterLog.bodyFat,
        bodyFatDiff: (afterLog.bodyFat - beforeLog.bodyFat).toFixed(1)
      };
    }
    return null;
  }, [compareResult, activeTrainee]);

  const renderDeltaBadge = (value: number, unit: string) => {
    if (value === 0) return <span className="text-[10px] text-muted-foreground font-bold font-mono">No change</span>;
    const isNegative = value < 0;
    const formattedVal = isNegative ? `${value.toFixed(1)} ${unit}` : `+${value.toFixed(1)} ${unit}`;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
        isNegative ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
      }`}>
        {isNegative ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
        {formattedVal}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">
      {/* Header with Search Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.progressTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.progressDesc}</p>
        </div>
        
        {/* Trainee Search Autocomplete Input */}
        <div className="relative w-full sm:w-80" ref={suggestionsRef}>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.searchTrainee}
              value={searchTraineeQuery}
              onFocus={() => setSuggestionsOpen(true)}
              onChange={(e) => {
                setSearchTraineeQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              className="pl-9 pr-8 py-2.5 w-full bg-card border border-border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-white"
            />
            {searchTraineeQuery && (
              <button 
                type="button" 
                onClick={() => setSearchTraineeQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete suggestions list dropdown */}
          <AnimatePresence>
            {suggestionsOpen && searchTraineeQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto space-y-1"
              >
                {filteredTrainees.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {language === 'en' ? 'No matching trainees found' : 'لم يتم العثور على متدربين مطابقين'}
                  </p>
                ) : (
                  filteredTrainees.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTraineeId(t.id);
                        setSuggestionsOpen(false);
                        setSearchTraineeQuery(t.name);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        selectedTraineeId === t.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary/50 text-white'
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className={`text-[10px] ${selectedTraineeId === t.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {t.goal}
                      </span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trainee Card details for quick confirmation */}
      {activeTrainee && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            <span className="text-xs font-bold text-muted-foreground">{t.activeProfile}</span>
            <span className="text-xs font-black text-white">{activeTrainee.name}</span>
            <span className="text-[10px] bg-secondary/80 border border-border px-2.5 py-0.5 rounded-full font-bold text-muted-foreground">
              {activeTrainee.goal}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {t.initialWeight} <span className="text-white font-bold">{activeTrainee.initialWeight}</span>
          </div>
        </div>
      )}



      {dateFilteredData.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border bg-card rounded-[2.5rem] text-muted-foreground space-y-2">
          <AlertCircle size={40} className="mx-auto mb-3 text-yellow-500 opacity-60" />
          <p className="font-bold text-base">{t.noRecords}</p>
          <p className="text-xs">{t.adjustFilters}</p>
        </div>
      ) : (
        <>
          {/* Trainee Stats Overview for Selected Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-card border border-border flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Scale size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">{t.currentWeight}</p>
                <p className="text-2xl font-black mt-0.5">{latestData.weight} {t.kg}</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">{t.periodWaist}</p>
                <p className="text-2xl font-black mt-0.5">{latestData.waist} {t.cm}</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">{t.periodFat}</p>
                <p className="text-2xl font-black mt-0.5">{latestData.bodyFat}%</p>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-border overflow-x-auto scrollbar-none">
            {(['weight', 'measurements', 'photos', 'journey'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all capitalize whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'weight' 
                  ? t.weightLogs 
                  : tab === 'measurements' 
                    ? t.measurementsRatios 
                    : tab === 'photos' 
                      ? t.progressPhotos 
                      : 'Client Journey Timeline'}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div>
            {activeTab === 'weight' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[2.5rem] bg-card border border-border"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold">{t.weightChartTitle}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t.weeklyTracking} {dateFilteredData[0]?.date} ({t.initialWeightInPeriod} {dateFilteredData[0]?.weight} {t.kg})
                    </p>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dateFilteredData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e1e" />
                      <XAxis 
                        dataKey="week" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        domain={['dataMin - 2', 'dataMax + 2']}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#9333ea" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'measurements' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Measurements Table */}
                <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border">
                  <h3 className="text-lg font-bold mb-6">{t.historicalTable}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-sm">
                          <th className="pb-4 font-medium">{t.timelineHeader}</th>
                          <th className="pb-4 font-medium">{t.dateHeader}</th>
                          <th className="pb-4 font-medium">{t.weightHeader}</th>
                          <th className="pb-4 font-medium">{t.waistHeader}</th>
                          <th className="pb-4 font-medium">{t.chestHeader}</th>
                          <th className="pb-4 font-medium">{t.bodyFatHeader}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dateFilteredData.slice().reverse().map((data, i) => (
                          <tr key={i} className="text-sm">
                            <td className="py-4 font-bold">{data.week}</td>
                            <td className="py-4 font-mono text-xs">{data.date}</td>
                            <td className="py-4">{data.weight} {t.kg}</td>
                            <td className="py-4">{data.waist} {t.cm}</td>
                            <td className="py-4">{data.chest} {t.cm}</td>
                            <td className="py-4 font-semibold text-primary">{data.bodyFat}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Metrics Breakdown Card */}
                <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-4 font-black">{t.progressAnalysis}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.analysisDesc}
                    </p>
                    <div className="mt-6 space-y-4">
                      <div className="p-4 rounded-xl bg-background border border-border">
                        <p className="text-xs text-muted-foreground font-bold">{t.totalWeightChange}</p>
                        <p className="text-lg font-black mt-1 text-primary">
                          {statsBreakdown.weightChange} {t.kg}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-background border border-border">
                        <p className="text-xs text-muted-foreground font-bold">{t.periodWaistReduction}</p>
                        <p className="text-lg font-black mt-1 text-primary">
                          {statsBreakdown.waistReduction} {t.cm}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="mt-8 w-full bg-secondary text-secondary-foreground py-3 rounded-xl text-sm font-bold hover:bg-secondary/80 transition-all">
                    {t.exportReport}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'photos' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Photos Grid */}
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold">Progress Photos Gallery</h3>
                    {activeTraineePhotos.length === 0 ? (
                      <div className="p-12 text-center border border-dashed border-border bg-card rounded-3xl text-muted-foreground">
                        <Camera size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-bold">No progress photos found</p>
                        <p className="text-xs">Upload progress photos on the right to track changes visually.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {activeTraineePhotos.map((photo) => (
                          <div 
                            key={photo.id} 
                            className="group relative aspect-[3/4] bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:border-primary/50 transition-all"
                          >
                            <img 
                              src={photo.imageUrl} 
                              alt={`${photo.week}`} 
                              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-300"
                            />
                            {/* Overlay details */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3 opacity-90 group-hover:opacity-100 transition-all">
                              <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  type="button"
                                  onClick={() => setLightboxPhoto(photo)}
                                  className="p-1.5 bg-black/60 border border-border/40 text-white rounded-lg hover:bg-black/80 transition-all"
                                  title="View photo"
                                >
                                  <Maximize2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(photo.id)}
                                  className="p-1.5 bg-rose-950/80 border border-rose-800/40 text-rose-300 rounded-lg hover:bg-rose-900 transition-all"
                                  title="Delete photo"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <div>
                                <p className="text-xs font-black text-white">{photo.week}</p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{photo.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Upload Photo Form */}
                  <div className="p-6 rounded-3xl bg-card border border-border h-fit space-y-4">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-primary" />
                      <h4 className="text-sm font-bold text-white">Upload Progress Photo</h4>
                    </div>
                    
                    <form onSubmit={handleUploadPhoto} className="space-y-4">
                      {/* File selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Photo</label>
                        <div className="relative border border-dashed border-border rounded-xl p-4 bg-background hover:bg-secondary/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                          />
                          <Upload size={20} className="text-muted-foreground mb-1.5" />
                          <span className="text-[11px] font-bold text-white">
                            {uploadFile ? uploadFile.name : 'Click to select image'}
                          </span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">PNG, JPG, or WEBP (Max 5MB)</span>
                        </div>
                        {fileError && <p className="text-[10px] text-rose-400 font-bold mt-1">{fileError}</p>}
                      </div>

                      {/* Week Label */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Associated Week</label>
                        <select 
                          value={uploadWeek} 
                          onChange={(e) => setUploadWeek(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary/20"
                          required
                        >
                          <option value="">Select week...</option>
                          {dateFilteredData.map((d, idx) => (
                            <option key={idx} value={d.week}>{d.week} ({d.date})</option>
                          ))}
                          <option value="Custom Week">Custom / Other Week</option>
                        </select>
                      </div>

                      {/* Custom Week Input if custom week selected */}
                      {uploadWeek === 'Custom Week' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Enter Week Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Week 6"
                            onChange={(e) => setUploadWeek(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary/20"
                            required
                          />
                        </div>
                      )}

                      {/* Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Photo Date</label>
                        <input
                          type="date"
                          lang="en-US"
                          value={uploadDate}
                          onChange={(e) => setUploadDate(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary/20"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!uploadFile || !uploadWeek}
                        className="w-full py-2.5 bg-primary disabled:opacity-40 text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        Add Photo
                      </button>
                    </form>
                  </div>
                </div>

                {/* Compare Photos Control */}
                {activeTraineePhotos.length >= 2 && (
                  <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-lg font-bold">Progress Photos Comparison</h3>
                        <p className="text-sm text-muted-foreground mt-1">Compare before and after body compositions and view dynamic metric changes.</p>
                      </div>
                      <div className="flex space-x-3 w-full sm:w-auto">
                        <select 
                          value={compareBeforeId} 
                          onChange={(e) => setCompareBeforeId(e.target.value)}
                          className="flex-1 sm:flex-none bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none text-white cursor-pointer"
                        >
                          {activeTraineePhotos.map((p) => (
                            <option key={p.id} value={p.id}>{p.week} ({p.date})</option>
                          ))}
                        </select>
                        <span className="self-center text-xs font-bold text-muted-foreground">vs</span>
                        <select 
                          value={compareAfterId} 
                          onChange={(e) => setCompareAfterId(e.target.value)}
                          className="flex-1 sm:flex-none bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none text-white cursor-pointer"
                        >
                          {activeTraineePhotos.map((p) => (
                            <option key={p.id} value={p.id}>{p.week} ({p.date})</option>
                          ))}
                        </select>
                        <button 
                          onClick={handleCompare}
                          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 transition-all"
                        >
                          Compare
                        </button>
                      </div>
                    </div>

                    {/* Comparison Display */}
                    {compareResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-card border border-border rounded-[2.5rem]"
                      >
                        {/* Before Side */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                            Before: {compareResult.before.week} ({compareResult.before.date})
                          </span>
                          <div className="w-full aspect-[3/4] max-w-sm bg-background border border-border rounded-3xl overflow-hidden relative group">
                            <img 
                              src={compareResult.before.imageUrl} 
                              alt="Before" 
                              className="w-full h-full object-cover"
                            />
                            <button 
                              onClick={() => setLightboxPhoto(compareResult.before)}
                              className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/60 border border-border text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Maximize2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* After Side */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
                            After: {compareResult.after.week} ({compareResult.after.date})
                          </span>
                          <div className="w-full aspect-[3/4] max-w-sm bg-background border border-border rounded-3xl overflow-hidden relative group">
                            <img 
                              src={compareResult.after.imageUrl} 
                              alt="After" 
                              className="w-full h-full object-cover"
                            />
                            <button 
                              onClick={() => setLightboxPhoto(compareResult.after)}
                              className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/60 border border-border text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Maximize2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Metrics Delta Summary */}
                        {comparisonMetrics && (
                          <div className="md:col-span-2 mt-4 p-6 rounded-2xl bg-background border border-border space-y-4">
                            <h4 className="text-sm font-bold text-white">Metrics Recomposition Deltas (Before vs After)</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-card border border-border rounded-xl text-center">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Weight Change</p>
                                <p className="text-sm font-black text-white mt-1">
                                  {compareResult.before.week !== compareResult.after.week ? (
                                    <>
                                      {comparisonMetrics.beforeWeight} kg → {comparisonMetrics.afterWeight} kg 
                                      <span className="block text-xs mt-0.5">
                                        {renderDeltaBadge(parseFloat(comparisonMetrics.weightDiff), 'kg')}
                                      </span>
                                    </>
                                  ) : (
                                    `${comparisonMetrics.beforeWeight} kg`
                                  )}
                                </p>
                              </div>
                              <div className="p-3 bg-card border border-border rounded-xl text-center">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Waist Change</p>
                                <p className="text-sm font-black text-white mt-1">
                                  {compareResult.before.week !== compareResult.after.week ? (
                                    <>
                                      {comparisonMetrics.beforeWaist} cm → {comparisonMetrics.afterWaist} cm
                                      <span className="block text-xs mt-0.5">
                                        {renderDeltaBadge(comparisonMetrics.waistDiff, 'cm')}
                                      </span>
                                    </>
                                  ) : (
                                    `${comparisonMetrics.beforeWaist} cm`
                                  )}
                                </p>
                              </div>
                              <div className="p-3 bg-card border border-border rounded-xl text-center">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Body Fat Change</p>
                                <p className="text-sm font-black text-white mt-1">
                                  {compareResult.before.week !== compareResult.after.week ? (
                                    <>
                                      {comparisonMetrics.beforeBodyFat}% → {comparisonMetrics.afterBodyFat}%
                                      <span className="block text-xs mt-0.5">
                                        {renderDeltaBadge(parseFloat(comparisonMetrics.bodyFatDiff), '%')}
                                      </span>
                                    </>
                                  ) : (
                                    `${comparisonMetrics.beforeBodyFat}%`
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'journey' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Journey Overview Summary Card */}
                {selectedData.length > 0 && (
                  <div className="p-6 rounded-[2.5rem] bg-card border border-border space-y-4">
                    <h3 className="text-lg font-black text-white">Client Journey Summary</h3>
                    <p className="text-xs text-muted-foreground">
                      Tracking client journey from starting log ({selectedData[0].date}) to current logs ({selectedData[selectedData.length - 1].date}).
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Overall Weight Change</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-black text-white">
                            {selectedData[0].weight} kg → {selectedData[selectedData.length - 1].weight} kg
                          </span>
                          {renderDeltaBadge(selectedData[selectedData.length - 1].weight - selectedData[0].weight, 'kg')}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Overall Waist Reduction</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-black text-white">
                            {selectedData[0].waist} cm → {selectedData[selectedData.length - 1].waist} cm
                          </span>
                          {renderDeltaBadge(selectedData[selectedData.length - 1].waist - selectedData[0].waist, 'cm')}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Overall Body Fat Change</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-black text-white">
                            {selectedData[0].bodyFat}% → {selectedData[selectedData.length - 1].bodyFat}%
                          </span>
                          {renderDeltaBadge(selectedData[selectedData.length - 1].bodyFat - selectedData[0].bodyFat, '%')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="relative border-l-2 border-border ml-6 pl-8 space-y-10 py-4">
                  {timelineEntries.map((entry, index) => {
                    const isFirst = index === 0;
                    
                    // Determine Milestone Message
                    let milestoneMessage = "";
                    let milestoneIcon = <Award size={12} className="text-primary-foreground" />;
                    let milestoneColor = "bg-primary";
                    
                    if (isFirst) {
                      milestoneMessage = "📍 Baseline point established. Ready to launch transformation!";
                      milestoneColor = "bg-blue-500";
                    } else {
                      const logs = [];
                      if (entry.weightDiffPrev < 0) logs.push(`dropped ${Math.abs(entry.weightDiffPrev).toFixed(1)} kg weight`);
                      if (entry.waistDiffPrev < 0) logs.push(`reduced waist by ${Math.abs(entry.waistDiffPrev)} cm`);
                      if (entry.fatDiffPrev < 0) logs.push(`reduced body fat by ${Math.abs(entry.fatDiffPrev).toFixed(1)}%`);
                      
                      if (logs.length > 0) {
                        milestoneMessage = `🔥 Milestone Achieved: Client successfully ${logs.join(' and ')} this week!`;
                        milestoneColor = "bg-emerald-500";
                      } else {
                        milestoneMessage = "📈 Consistency Logged: Baseline measurements updated.";
                        milestoneColor = "bg-zinc-600";
                      }
                    }

                    return (
                      <div key={index} className="relative">
                        {/* Timeline Node Icon/Dot */}
                        <div className={`absolute -left-[43px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-background text-white ${milestoneColor} shadow-md`}>
                          {isFirst ? <Calendar size={12} /> : milestoneIcon}
                        </div>

                        {/* Timeline Card */}
                        <div className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-primary/20 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                            <div>
                              <h4 className="text-base font-extrabold text-white">{entry.week}</h4>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{entry.date}</p>
                            </div>
                            <span className="text-[10px] bg-secondary border border-border px-3 py-1 rounded-full text-muted-foreground font-bold">
                              {entry.week} Log details
                            </span>
                          </div>

                          {/* Stats details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Weight</span>
                              <span className="text-sm font-black text-white">{entry.weight} kg</span>
                              <div className="mt-0.5">
                                {renderDeltaBadge(entry.weightDiffPrev, 'kg')}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Waist</span>
                              <span className="text-sm font-black text-white">{entry.waist} cm</span>
                              <div className="mt-0.5">
                                {renderDeltaBadge(entry.waistDiffPrev, 'cm')}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Chest</span>
                              <span className="text-sm font-black text-white">{entry.chest} cm</span>
                              <div className="mt-0.5">
                                {renderDeltaBadge(entry.chestDiffPrev, 'cm')}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Body Fat</span>
                              <span className="text-sm font-black text-white">{entry.bodyFat}%</span>
                              <div className="mt-0.5">
                                {renderDeltaBadge(entry.fatDiffPrev, '%')}
                              </div>
                            </div>
                          </div>

                          {/* Milestone message card */}
                          <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs font-bold text-muted-foreground">
                            {milestoneMessage}
                          </div>

                          {/* Week Photo attached if any */}
                          {entry.photo && (
                            <div className="pt-2">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-2">Attached Progress Photo</span>
                              <div className="relative w-28 aspect-[3/4] bg-background border border-border rounded-xl overflow-hidden group cursor-pointer" onClick={() => setLightboxPhoto(entry.photo || null)}>
                                <img 
                                  src={entry.photo.imageUrl} 
                                  alt={`${entry.week} progress`} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                  <Maximize2 size={14} className="text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-2xl w-full bg-card border border-border rounded-[2rem] overflow-hidden p-6 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="absolute right-4 top-4 p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-white transition-all"
              >
                <X size={16} />
              </button>
              
              <div className="text-center">
                <h3 className="text-base font-extrabold text-white">{activeTrainee.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{lightboxPhoto.week} — {lightboxPhoto.date}</p>
              </div>

              <div className="aspect-[3/4] max-h-[65vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-background border border-border">
                <img 
                  src={lightboxPhoto.imageUrl} 
                  alt={`${lightboxPhoto.week} progress`} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
