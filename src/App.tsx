import React, { useState, useMemo, useEffect } from 'react';
import { Bus, Car, Calendar, MapPin, Clock, AlertCircle, Users, CheckCircle2, Info, Plus, X, Printer, ChevronDown, FileText, Trophy, Activity, Edit, Share2, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// --- Types ---
type VehicleType = 'bus' | 'van';

interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number;
  maxTrips: number;
}

interface ScheduleItem {
  id: string;
  date: string;
  sport: string;
  venue: string;
  matchTime: string;
  departTime: string;
  passengers: number;
  assignedVehicles: string[];
  notes: string;
}

interface MatchItem {
  id: string;
  date: string;
  sport: string;
  event: string;
  athletesCount: number;
  status: string;
}

// --- Initial Data ---
const VEHICLES: Vehicle[] = [
  { id: 'bus1', name: 'รถบัส', type: 'bus', capacity: 50, maxTrips: 1 },
  { id: 'van1', name: 'รถตู้ (คันที่ 1)', type: 'van', capacity: 10, maxTrips: 3 },
  { id: 'van2', name: 'รถตู้ (คันที่ 2)', type: 'van', capacity: 10, maxTrips: 3 },
  { id: 'van3', name: 'รถตู้ (คันที่ 3)', type: 'van', capacity: 10, maxTrips: 3 },
  { id: 'van4', name: 'รถตู้ (คันที่ 4)', type: 'van', capacity: 10, maxTrips: 3 },
  { id: 'van5', name: 'รถตู้ (คันที่ 5)', type: 'van', capacity: 10, maxTrips: 3 },
];

// หมายเหตุ: ข้อมูลการแข่งขันหลัก (รอบฝึกซ้อมสามารถเพิ่มได้เองผ่านระบบ)
const INITIAL_SCHEDULE: ScheduleItem[] = [
  // 6 เม.ย. 69
  { id: '1', date: '2026-04-06', sport: 'วอลเลย์บอล (ญ/ช)', venue: 'โรงยิม 1', matchTime: '10:00 / 11:00', departTime: '08:00', passengers: 19, assignedVehicles: ['van1', 'van2'], notes: 'ช 9 + ญ 10 คน' },
  { id: '2', date: '2026-04-06', sport: 'แชร์บอล (ญ)', venue: 'โรงยิมฟุตซอล', matchTime: '14:00', departTime: '12:00', passengers: 18, assignedVehicles: ['van3', 'van4'], notes: 'ญ 18 คน' },
  { id: '3', date: '2026-04-06', sport: 'พิธีเปิด + ฟุตบอล (ช) + กรีฑา', venue: 'สนามกีฬากลาง', matchTime: '15:00 / 17:30', departTime: '13:00', passengers: 50, assignedVehicles: ['bus1'], notes: 'ฟุตบอล SRU vs สงขลา | กรีฑา 100m, 4x100m' },
  { id: '4', date: '2026-04-06', sport: 'บาสเกตบอล 3x3 (ญ/ช)', venue: 'โรงยิม 1', matchTime: '18:20 / 19:00', departTime: '16:20', passengers: 13, assignedVehicles: ['van5', 'van1'], notes: 'ช 6 + ญ 7 คน' },
  
  // 7 เม.ย. 69
  { id: '5', date: '2026-04-07', sport: 'ฟุตบอล (ช) - สาย A นัดที่ 2', venue: 'สนามกีฬากลาง', matchTime: '16:30', departTime: '14:30', passengers: 20, assignedVehicles: ['van2', 'van3'], notes: 'มรภ.ภูเก็ต vs ผู้ชนะคู่ที่ 1' },
  { id: '6', date: '2026-04-07', sport: 'งานเลี้ยงรับรอง', venue: 'ข้างหอประชุมใหญ่', matchTime: '18:00', departTime: '16:30', passengers: 40, assignedVehicles: ['bus1'], notes: 'ผู้บริหารและตัวแทนนักกีฬา' },

  // 8 เม.ย. 69
  { id: '7', date: '2026-04-08', sport: 'ฟุตบอล (ช) - สาย A นัดที่ 2', venue: 'สนามกีฬากลาง', matchTime: '18:00', departTime: '16:00', passengers: 20, assignedVehicles: ['bus1'], notes: 'ผู้แพ้คู่ที่ 1 vs มรภ.ภูเก็ต' },
  { id: '8', date: '2026-04-08', sport: 'กรีฑา', venue: 'สนามกีฬากลาง', matchTime: '19:00', departTime: '17:00', passengers: 20, assignedVehicles: ['van4', 'van5'], notes: 'วิ่ง 200m, ผลัดต่างระยะ' },

  // 9 เม.ย. 69
  { id: '9', date: '2026-04-09', sport: 'ฟุตบอล (ช) - รอบรองชนะเลิศ', venue: 'สนามกีฬากลาง', matchTime: '17:30 / 19:00', departTime: '15:30', passengers: 20, assignedVehicles: ['bus1'], notes: 'ที่ 1 สาย A vs ที่ 2 สาย B' },
  { id: '10', date: '2026-04-09', sport: 'กรีฑา', venue: 'สนามกีฬากลาง', matchTime: '18:00 - 19:30', departTime: '16:00', passengers: 20, assignedVehicles: ['van1', 'van2'], notes: 'วิ่งผลัด 5x80m, ผลัดผสม 4x100m' },

  // 10 เม.ย. 69
  { id: '11', date: '2026-04-10', sport: 'ฟุตบอล (ช) - รอบชิงชนะเลิศ', venue: 'สนามกีฬากลาง', matchTime: '17:30 / 19:00', departTime: '15:30', passengers: 20, assignedVehicles: ['bus1'], notes: 'ชิงอันดับ 3 (17.30) | ชิงชนะเลิศ (19.00)' },
];

const DATES = ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10'];

const INITIAL_MATCHES: MatchItem[] = [
  // 6 เม.ย. 69
  { id: 'm1', date: '2026-04-06', sport: 'วอลเลย์บอล', event: 'ทีมหญิง', athletesCount: 10, status: 'รอบแรก' },
  { id: 'm2', date: '2026-04-06', sport: 'วอลเลย์บอล', event: 'ทีมชาย', athletesCount: 9, status: 'รอบแรก' },
  { id: 'm3', date: '2026-04-06', sport: 'แชร์บอล', event: 'ทีมหญิง', athletesCount: 18, status: 'รอบแรก' },
  { id: 'm4', date: '2026-04-06', sport: 'ฟุตบอล', event: 'ทีมชาย สาย A นัดที่ 1', athletesCount: 20, status: 'รอบแรก' },
  { id: 'm5', date: '2026-04-06', sport: 'กรีฑา', event: '100m, 4x100m', athletesCount: 10, status: 'รอบคัดเลือก' },
  { id: 'm6', date: '2026-04-06', sport: 'บาสเกตบอล 3x3', event: 'ทีมหญิง', athletesCount: 7, status: 'รอบแรก' },
  { id: 'm7', date: '2026-04-06', sport: 'บาสเกตบอล 3x3', event: 'ทีมชาย', athletesCount: 6, status: 'รอบแรก' },

  // 7 เม.ย. 69
  { id: 'm8', date: '2026-04-07', sport: 'ฟุตบอล', event: 'ทีมชาย สาย A นัดที่ 2', athletesCount: 20, status: 'รอบแรก' },

  // 8 เม.ย. 69
  { id: 'm9', date: '2026-04-08', sport: 'ฟุตบอล', event: 'ทีมชาย สาย A นัดที่ 3', athletesCount: 20, status: 'รอบแรก' },
  { id: 'm10', date: '2026-04-08', sport: 'กรีฑา', event: 'วิ่ง 200m, ผลัดต่างระยะ', athletesCount: 20, status: 'รอบคัดเลือก' },

  // 9 เม.ย. 69
  { id: 'm11', date: '2026-04-09', sport: 'ฟุตบอล', event: 'ทีมชาย', athletesCount: 20, status: 'รอบรองชนะเลิศ' },
  { id: 'm12', date: '2026-04-09', sport: 'กรีฑา', event: 'วิ่งผลัด 5x80m, ผลัดผสม 4x100m', athletesCount: 20, status: 'ชิงชนะเลิศ' },

  // 10 เม.ย. 69
  { id: 'm13', date: '2026-04-10', sport: 'ฟุตบอล', event: 'ทีมชาย', athletesCount: 20, status: 'ชิงชนะเลิศ' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'transport' | 'matches'>('transport');
  
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('sru-schedules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SCHEDULE;
  });

  const [matches, setMatches] = useState<MatchItem[]>(() => {
    const saved = localStorage.getItem('sru-matches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MATCHES;
  });

  useEffect(() => {
    localStorage.setItem('sru-schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('sru-matches', JSON.stringify(matches));
  }, [matches]);

  const [selectedDate, setSelectedDate] = useState<string>(DATES[0]);
  
  // Print State
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [printMode, setPrintMode] = useState<'master' | 'jobs' | null>(null);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://ais-pre-4tumkywh7olo6imxnmz27w-49481016620.asia-southeast1.run.app";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '2517') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  // Add Trip State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    sport: 'ฝึกซ้อม...',
    venue: '',
    matchTime: '',
    departTime: '',
    passengers: 10,
    notes: 'สแตนด์บายรอรับกลับ (ไป-กลับ)'
  });

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const trip: ScheduleItem = {
      id: `custom-${Date.now()}`,
      date: selectedDate,
      sport: newTrip.sport,
      venue: newTrip.venue,
      matchTime: newTrip.matchTime,
      departTime: newTrip.departTime,
      passengers: newTrip.passengers,
      assignedVehicles: [],
      notes: newTrip.notes
    };
    setSchedules(prev => [...prev, trip]);
    setShowAddForm(false);
    setNewTrip({ sport: 'ฝึกซ้อม...', venue: '', matchTime: '', departTime: '', passengers: 10, notes: 'สแตนด์บายรอรับกลับ (ไป-กลับ)' });
  };

  const handleDeleteTrip = (id: string) => {
    if (window.confirm('ต้องการลบเที่ยววิ่งนี้ใช่หรือไม่?')) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  // Match State
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchItem | null>(null);
  const [newMatch, setNewMatch] = useState<Omit<MatchItem, 'id'>>({
    date: DATES[0],
    sport: '',
    event: '',
    athletesCount: 1,
    status: 'รอบแรก'
  });

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMatch) {
      setMatches(prev => prev.map(m => m.id === editingMatch.id ? { ...editingMatch } : m));
    } else {
      const match: MatchItem = {
        id: `match-${Date.now()}`,
        ...newMatch
      };
      setMatches(prev => [...prev, match]);
    }
    setShowMatchForm(false);
    setEditingMatch(null);
    setNewMatch({ date: selectedDate, sport: '', event: '', athletesCount: 1, status: 'รอบแรก' });
  };

  const handleDeleteMatch = (id: string) => {
    if (window.confirm('ต้องการลบรายการแข่งขันนี้ใช่หรือไม่?')) {
      setMatches(prev => prev.filter(m => m.id !== id));
    }
  };

  // Filter schedules for the selected date
  const dailySchedules = useMemo(() => 
    schedules.filter(s => s.date === selectedDate).sort((a, b) => a.departTime.localeCompare(b.departTime)),
  [schedules, selectedDate]);

  const dailyMatches = useMemo(() => 
    matches.filter(m => m.date === selectedDate),
  [matches, selectedDate]);

  // Calculate vehicle usage for the selected date
  const vehicleUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    VEHICLES.forEach(v => usage[v.id] = 0);
    
    dailySchedules.forEach(s => {
      s.assignedVehicles.forEach(vId => {
        usage[vId] = (usage[vId] || 0) + 1;
      });
    });
    return usage;
  }, [dailySchedules]);

  // Handle vehicle assignment toggle
  const toggleVehicle = (scheduleId: string, vehicleId: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== scheduleId) return s;
      
      const isAssigned = s.assignedVehicles.includes(vehicleId);
      let newAssigned = [...s.assignedVehicles];
      
      if (isAssigned) {
        newAssigned = newAssigned.filter(id => id !== vehicleId);
      } else {
        newAssigned.push(vehicleId);
      }
      
      return { ...s, assignedVehicles: newAssigned };
    }));
  };

  // Handle passenger count change
  const updatePassengers = (scheduleId: string, count: number) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, passengers: count } : s
    ));
  };

  // Handle Print
  const handlePrint = (mode: 'master' | 'jobs') => {
    setPrintMode(mode);
    setShowPrintMenu(false);
    // Wait for React to render the print-specific DOM before calling window.print()
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 300);
  };

  // Close print menu when clicking outside (simplified)
  useEffect(() => {
    const handleClickOutside = () => setShowPrintMenu(false);
    if (showPrintMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPrintMenu]);

  // Dashboard Metrics
  const totalVanTripsUsed = VEHICLES.filter(v => v.type === 'van').reduce((acc, v) => acc + vehicleUsage[v.id], 0);
  const totalVanTripsMax = 5 * 3; // 5 vans * 3 trips
  const tripsRemaining = totalVanTripsMax - totalVanTripsUsed;
  const vanSeatsRemaining = tripsRemaining * 10; // 10 seats per van trip

  const formattedDate = new Date(selectedDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 print:bg-white print:pb-0">
      
      {/* --- NORMAL DASHBOARD VIEW (Hidden when printing Job Sheets) --- */}
      <div className={printMode === 'jobs' ? 'hidden' : 'block'}>
        {/* Header */}
        <header className="bg-blue-900 text-white p-6 shadow-md print:bg-white print:text-black print:shadow-none print:p-0 print:mb-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 print:text-black">
                <Bus className="w-8 h-8 print:hidden" />
                SRU Transport Dashboard
              </h1>
              <p className="text-blue-200 text-sm mt-1 print:text-slate-600">ระบบจัดการรถรับ-ส่งนักกีฬา (อัปเดตความจุผู้โดยสาร)</p>
            </div>
            
            <div className="flex items-center gap-4 print:hidden">
              {/* Date Selector */}
              <div className="flex bg-blue-800 rounded-lg p-1">
                {DATES.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedDate === date 
                        ? 'bg-white text-blue-900 shadow-sm' 
                        : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </button>
                ))}
              </div>

              {/* Admin Login & Share */}
              <div className="print:hidden flex items-center gap-2">
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium transition-colors border border-white/20"
                >
                  <Share2 className="w-4 h-4" />
                  แชร์
                </button>
                {isAdmin ? (
                  <button 
                    onClick={() => setIsAdmin(false)}
                    className="px-4 py-2 bg-red-600/20 text-red-100 hover:bg-red-600/40 rounded-md text-sm font-medium transition-colors"
                  >
                    ออกจากระบบ Admin
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowAdminLogin(true)}
                    className="px-4 py-2 bg-blue-800/50 text-blue-100 hover:bg-blue-800 rounded-md text-sm font-medium transition-colors border border-blue-700"
                  >
                    เข้าสู่ระบบ Admin
                  </button>
                )}
              </div>

              {/* Print Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setShowPrintMenu(!showPrintMenu)} 
                  className="flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-blue-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์เอกสาร
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showPrintMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-slate-200 overflow-hidden z-50">
                    <button 
                      onClick={() => handlePrint('master')} 
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                    >
                      <Calendar className="w-4 h-4 text-blue-600" />
                      พิมพ์ตารางรวมวันนี้
                    </button>
                    <button 
                      onClick={() => handlePrint('jobs')} 
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      พิมพ์ใบงานแยกรายคัน
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-8 print:p-0">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 print:hidden">
            <button
              onClick={() => setActiveTab('transport')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'transport'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Bus className="w-4 h-4" />
              จัดการรถรับ-ส่ง
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'matches'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Trophy className="w-4 h-4" />
              ข้อมูลการแข่งขัน
            </button>
          </div>

          {activeTab === 'transport' && (
            <>
              {/* Print-only Title */}
              <div className="hidden print:block mb-6">
                <h2 className="text-2xl font-bold text-center">ตารางเดินรถประจำวันที่ {formattedDate}</h2>
              </div>

              {/* Notification Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg print:hidden">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-blue-800 font-bold">เงื่อนไขการขอรถสำหรับฝึกซ้อม</h3>
                <p className="text-blue-700 text-sm mt-1">
                  หากต้องการเพิ่มเที่ยววิ่งสำหรับการฝึกซ้อม กรุณากดเพิ่มเที่ยววิ่งในระบบ และ <span className="font-bold underline">ต้องแจ้งเจ้าหน้าที่ภายในเวลา 16:00 น. ของวันก่อนหน้า</span> เพื่อให้เจ้าหน้าที่จัดเตรียมรถตู้สแตนด์บายได้ทันเวลา
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Cards (Hidden in print) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">รอบเดินรถวันนี้</p>
                <p className="text-2xl font-bold text-slate-800">{dailySchedules.length} <span className="text-sm font-normal text-slate-500">รอบ</span></p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">โควตารถตู้ใช้ไป</p>
                <p className="text-2xl font-bold text-slate-800">{totalVanTripsUsed} <span className="text-sm font-normal text-slate-500">/ {totalVanTripsMax} เที่ยว</span></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">โควตารถตู้คงเหลือ</p>
                <p className="text-2xl font-bold text-emerald-600">{tripsRemaining} <span className="text-sm font-normal text-emerald-500">เที่ยว</span></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className="p-4 bg-amber-100 text-amber-600 rounded-full">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">ที่นั่งรถตู้คงเหลือ (วันนี้)</p>
                <p className="text-2xl font-bold text-amber-600">{vanSeatsRemaining} <span className="text-sm font-normal text-amber-500">ที่นั่ง</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 print:block">
            
            {/* Schedule Table */}
            <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-slate-800">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center print:bg-white print:border-slate-800">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 print:hidden" />
                  ตารางเดินรถและจัดสรรที่นั่ง
                </h2>
                {isAdmin && (
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors print:hidden"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มเที่ยววิ่ง (ซ้อม/อื่นๆ)
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px] print:min-w-full">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200 print:bg-slate-100 print:text-black print:border-slate-800">
                      <th className="p-4 font-medium w-32 print:border-r print:border-slate-800">เวลาล้อหมุน</th>
                      <th className="p-4 font-medium w-48 print:border-r print:border-slate-800">กีฬา / กิจกรรม</th>
                      <th className="p-4 font-medium w-32 print:border-r print:border-slate-800">จำนวนคน</th>
                      <th className="p-4 font-medium">จัดรถรับ-ส่ง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-800">
                    {dailySchedules.map((schedule) => {
                      // Calculate capacity
                      const currentCapacity = schedule.assignedVehicles.reduce((sum, vId) => {
                        const v = VEHICLES.find(v => v.id === vId);
                        return sum + (v ? v.capacity : 0);
                      }, 0);
                      
                      const isOverCapacity = schedule.passengers > currentCapacity;
                      const seatsRemaining = currentCapacity - schedule.passengers;

                      return (
                        <tr key={schedule.id} className="hover:bg-slate-50 transition-colors print:hover:bg-white">
                          <td className="p-4 align-top print:border-r print:border-slate-800">
                            <div className="flex items-center gap-2 text-blue-700 font-bold print:text-black">
                              <Clock className="w-4 h-4 print:hidden" />
                              {schedule.departTime} น.
                            </div>
                            <div className="text-xs text-slate-400 mt-1 print:text-slate-600">แข่ง: {schedule.matchTime}</div>
                          </td>
                          <td className="p-4 align-top print:border-r print:border-slate-800">
                            <p className="font-medium text-slate-800">{schedule.sport}</p>
                            <p className="text-xs text-slate-500 mt-1 print:text-slate-600">{schedule.venue}</p>
                            {schedule.notes && <p className="text-xs text-blue-500 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded print:bg-transparent print:p-0 print:text-slate-600">หมายเหตุ: {schedule.notes}</p>}
                          </td>
                          <td className="p-4 align-top print:border-r print:border-slate-800">
                            <div className="flex items-center gap-2">
                              {/* Interactive Input for Web */}
                              <input 
                                type="number" 
                                min="1"
                                value={schedule.passengers}
                                onChange={(e) => updatePassengers(schedule.id, parseInt(e.target.value) || 0)}
                                className="w-16 p-1.5 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none print:hidden"
                              />
                              {/* Static Text for Print */}
                              <span className="hidden print:inline font-bold">{schedule.passengers}</span>
                              <span className="text-sm text-slate-500 print:text-black">คน</span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="space-y-3">
                              {/* Status Bar (Hidden in print) */}
                              <div className={`flex items-center justify-between p-2 rounded-lg text-sm border print:hidden ${
                                isOverCapacity ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}>
                                <div className="flex items-center gap-2 font-medium">
                                  {isOverCapacity ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                  ความจุรวม: {currentCapacity} ที่นั่ง
                                </div>
                                <div className="text-xs">
                                  {isOverCapacity 
                                    ? `ขาดอีก ${schedule.passengers - currentCapacity} ที่นั่ง` 
                                    : `ว่าง ${seatsRemaining} ที่นั่ง`}
                                </div>
                              </div>

                              {/* Vehicle Selection Chips (Hidden in print) */}
                              <div className="flex flex-wrap gap-2 print:hidden">
                                {VEHICLES.map(v => {
                                  const isAssigned = schedule.assignedVehicles.includes(v.id);
                                  const used = vehicleUsage[v.id] || 0;
                                  const isFull = used >= v.maxTrips && !isAssigned;
                                  
                                  return (
                                    <button
                                      key={v.id}
                                      disabled={isFull}
                                      onClick={() => toggleVehicle(schedule.id, v.id)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                        isAssigned 
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                          : isFull
                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                            : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                                      }`}
                                    >
                                      {v.type === 'bus' ? <Bus className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                                      {v.name} ({v.capacity} ที่)
                                      {isAssigned && <X className="w-3 h-3 ml-0.5" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Static Assigned Vehicles for Print */}
                              <div className="hidden print:block font-medium text-slate-800">
                                {schedule.assignedVehicles.length > 0 
                                  ? schedule.assignedVehicles.map(id => VEHICLES.find(v => v.id === id)?.name).join(', ')
                                  : '- ยังไม่จัดรถ -'}
                              </div>
                              
                              {/* Delete Trip Button */}
                              {isAdmin && (
                                <button 
                                  onClick={() => handleDeleteTrip(schedule.id)}
                                  className="mt-3 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 print:hidden"
                                >
                                  <X className="w-3 h-3" /> ลบเที่ยววิ่งนี้
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {dailySchedules.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                            <Calendar className="w-12 h-12 text-slate-300 mb-3 print:hidden" />
                            <p>ไม่มีโปรแกรมการแข่งขันในวันนี้</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vehicle Status Sidebar (Hidden in print) */}
            <div className="space-y-6 print:hidden">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  ข้อมูลรถและที่นั่ง
                </h2>
                
                <div className="mb-6 pb-6 border-b border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">สถานะรถบัส (ความจุ 50 ที่นั่ง/คัน)</h3>
                  {VEHICLES.filter(v => v.type === 'bus').map(bus => {
                    const used = vehicleUsage[bus.id] || 0;
                    const percentage = (used / bus.maxTrips) * 100;
                    const isFull = used >= bus.maxTrips;
                    
                    return (
                      <div key={bus.id} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{bus.name}</span>
                          <span className={isFull ? 'text-red-500 font-bold' : 'text-slate-500'}>
                            {used} / {bus.maxTrips} เที่ยว
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? 'bg-red-500' : used > 0 ? 'bg-indigo-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">สถานะรถตู้ (ความจุ 10 ที่นั่ง/คัน)</h3>
                  {VEHICLES.filter(v => v.type === 'van').map(van => {
                    const used = vehicleUsage[van.id] || 0;
                    const percentage = (used / van.maxTrips) * 100;
                    const isFull = used >= van.maxTrips;
                    
                    return (
                      <div key={van.id} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{van.name}</span>
                          <span className={isFull ? 'text-red-500 font-bold' : 'text-slate-500'}>
                            {used} / {van.maxTrips} เที่ยว
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? 'bg-red-500' : used > 0 ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-800 mb-2">💡 ข้อควรระวัง</h3>
                  <ul className="text-xs text-amber-700 space-y-1.5 list-disc pl-4">
                    <li>หากจำนวนคนเกิน 10 คน ต้องเลือกรถตู้มากกว่า 1 คัน หรือใช้รถบัส</li>
                    <li>ระบบจะแจ้งเตือนสีแดงหากความจุรถไม่เพียงพอต่อจำนวนคน</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
          </>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    รายการแข่งขันประจำวันที่ {formattedDate}
                  </h2>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setEditingMatch(null);
                        setNewMatch({ date: selectedDate, sport: '', event: '', athletesCount: 1, status: 'รอบแรก' });
                        setShowMatchForm(true);
                      }}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มรายการแข่งขัน
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <th className="p-4 font-medium w-48">กีฬา</th>
                        <th className="p-4 font-medium w-64">ประเภท/รายการ</th>
                        <th className="p-4 font-medium w-32 text-center">จำนวนนักกีฬา</th>
                        <th className="p-4 font-medium w-48">สถานะ</th>
                        {isAdmin && <th className="p-4 font-medium w-32 text-right">จัดการ</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dailyMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-800">{match.sport}</td>
                          <td className="p-4 text-slate-600">{match.event}</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                              {match.athletesCount} คน
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              match.status.includes('ชิง') || match.status.includes('เหรียญ')
                                ? 'bg-amber-100 text-amber-800'
                                : match.status.includes('ตกรอบ')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {match.status}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingMatch(match);
                                    setNewMatch({
                                      date: match.date,
                                      sport: match.sport,
                                      event: match.event,
                                      athletesCount: match.athletesCount,
                                      status: match.status
                                    });
                                    setShowMatchForm(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="แก้ไข"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMatch(match.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="ลบ"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {dailyMatches.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="p-8 text-center text-slate-500">
                            ไม่มีรายการแข่งขันในวันนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- SHARE MODAL --- */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                แชร์แอปพลิเคชัน
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <QRCodeSVG 
                  value={shareUrl} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm text-slate-500 text-center">
                สแกน QR Code เพื่อเปิดใช้งานบนมือถือ หรือคัดลอกลิงก์ด้านล่างเพื่อแชร์
              </p>
              <div className="w-full flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
                />
                <button 
                  onClick={handleCopyLink}
                  className={`p-2.5 rounded-lg flex-shrink-0 transition-colors ${
                    copied ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  title="คัดลอกลิงก์"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADMIN LOGIN MODAL --- */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">เข้าสู่ระบบ Admin</h3>
              <button onClick={() => { setShowAdminLogin(false); setAdminError(''); setAdminPassword(''); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdminLogin} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
                <input 
                  autoFocus
                  required 
                  type="password" 
                  value={adminPassword} 
                  onChange={e => setAdminPassword(e.target.value)} 
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="กรอกรหัสผ่าน" 
                />
                {adminError && <p className="text-red-500 text-sm mt-1">{adminError}</p>}
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowAdminLogin(false); setAdminError(''); setAdminPassword(''); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">เข้าสู่ระบบ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MATCH FORM MODAL --- */}
      {showMatchForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingMatch ? 'แก้ไขรายการแข่งขัน' : 'เพิ่มรายการแข่งขัน'}
              </h3>
              <button onClick={() => { setShowMatchForm(false); setEditingMatch(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">กีฬา</label>
                <input 
                  required 
                  type="text" 
                  value={newMatch.sport} 
                  onChange={e => setNewMatch({...newMatch, sport: e.target.value})} 
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="เช่น วอลเลย์บอล, ฟุตบอล" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท/รายการ</label>
                <input 
                  required 
                  type="text" 
                  value={newMatch.event} 
                  onChange={e => setNewMatch({...newMatch, event: e.target.value})} 
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="เช่น ทีมหญิง สาย B, วิ่ง 100m" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนนักกีฬา (คน)</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    value={newMatch.athletesCount} 
                    onChange={e => setNewMatch({...newMatch, athletesCount: parseInt(e.target.value) || 1})} 
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                  <select 
                    value={newMatch.status}
                    onChange={e => setNewMatch({...newMatch, status: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="รอบแรก">รอบแรก</option>
                    <option value="รอบคัดเลือก">รอบคัดเลือก</option>
                    <option value="รอบสอง">รอบสอง</option>
                    <option value="รอบก่อนรองชนะเลิศ">รอบก่อนรองชนะเลิศ (8 ทีม)</option>
                    <option value="รอบรองชนะเลิศ">รอบรองชนะเลิศ (4 ทีม)</option>
                    <option value="ชิงชนะเลิศ">ชิงชนะเลิศ</option>
                    <option value="ชิงอันดับ 3">ชิงอันดับ 3</option>
                    <option value="ตกรอบ">ตกรอบ</option>
                    <option value="ได้เหรียญทอง">ได้เหรียญทอง 🥇</option>
                    <option value="ได้เหรียญเงิน">ได้เหรียญเงิน 🥈</option>
                    <option value="ได้เหรียญทองแดง">ได้เหรียญทองแดง 🥉</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowMatchForm(false); setEditingMatch(null); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
                  {editingMatch ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD TRIP MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">เพิ่มเที่ยววิ่ง (ฝึกซ้อม/อื่นๆ)</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTrip} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">กีฬา / กิจกรรม</label>
                <input required type="text" value={newTrip.sport} onChange={e => setNewTrip({...newTrip, sport: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น ฝึกซ้อมวอลเลย์บอล" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่</label>
                  <input required type="text" value={newTrip.venue} onChange={e => setNewTrip({...newTrip, venue: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น โรงยิม 2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนคน</label>
                  <input required type="number" min="1" value={newTrip.passengers} onChange={e => setNewTrip({...newTrip, passengers: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เวลาล้อหมุน</label>
                  <input required type="time" value={newTrip.departTime} onChange={e => setNewTrip({...newTrip, departTime: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เวลาซ้อม/แข่ง</label>
                  <input required type="text" value={newTrip.matchTime} onChange={e => setNewTrip({...newTrip, matchTime: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น 09:00 - 11:00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <input type="text" value={newTrip.notes} onChange={e => setNewTrip({...newTrip, notes: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">บันทึกเที่ยววิ่ง</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- JOB SHEETS PRINT VIEW (Only visible when printing Job Sheets) --- */}
      {printMode === 'jobs' && (
        <div className="hidden print:block p-8 bg-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ใบงานจัดรถรับ-ส่งนักกีฬา</h1>
            <p className="text-lg">ประจำวันที่ {formattedDate}</p>
          </div>

          {VEHICLES.map(vehicle => {
            // Find schedules assigned to this vehicle
            const assignedSchedules = dailySchedules.filter(s => s.assignedVehicles.includes(vehicle.id));
            
            // Skip vehicles with no assignments today
            if (assignedSchedules.length === 0) return null;

            return (
              <div key={vehicle.id} className="mb-12 break-inside-avoid border-2 border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-100 border-b-2 border-slate-800 p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {vehicle.type === 'bus' ? <Bus className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    {vehicle.name}
                  </h2>
                  <div className="text-sm font-medium">
                    ประเภท: {vehicle.type === 'bus' ? 'รถบัส' : 'รถตู้'} | ความจุ: {vehicle.capacity} ที่นั่ง
                  </div>
                </div>
                
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="p-3 border-r border-slate-300 w-24">เวลาล้อหมุน</th>
                      <th className="p-3 border-r border-slate-300 w-48">กีฬา / กิจกรรม</th>
                      <th className="p-3 border-r border-slate-300">สถานที่</th>
                      <th className="p-3 border-r border-slate-300 w-24 text-center">จำนวนคน</th>
                      <th className="p-3">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {assignedSchedules.map((schedule, index) => (
                      <tr key={schedule.id}>
                        <td className="p-3 border-r border-slate-300 font-bold">{schedule.departTime} น.</td>
                        <td className="p-3 border-r border-slate-300">
                          {schedule.sport}
                          <div className="text-xs text-slate-500 mt-1">แข่ง: {schedule.matchTime}</div>
                        </td>
                        <td className="p-3 border-r border-slate-300">{schedule.venue}</td>
                        <td className="p-3 border-r border-slate-300 text-center">{schedule.passengers}</td>
                        <td className="p-3 text-sm">{schedule.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="p-4 bg-slate-50 border-t border-slate-300 flex justify-between text-sm">
                  <div>รวมจำนวนเที่ยววิ่งวันนี้: <b>{assignedSchedules.length}</b> เที่ยว</div>
                  <div>ชื่อพนักงานขับรถ: ........................................................</div>
                </div>
              </div>
            );
          })}

          {/* Fallback if no vehicles are assigned */}
          {VEHICLES.every(v => dailySchedules.filter(s => s.assignedVehicles.includes(v.id)).length === 0) && (
            <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-lg">
              <p className="text-xl text-slate-500">ยังไม่มีการจัดรถในวันนี้</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

