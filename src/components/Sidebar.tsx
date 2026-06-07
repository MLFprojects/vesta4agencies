import { Layers, PlusCircle, FileText, Sliders, LogOut, User, Building2, Users } from 'lucide-react';
import { Logo } from './Logo';

export interface VestaUser {
  uid: string;
  email: string;
  agencyName: string;
  collaborators: '1-3' | '3-5' | '5-10' | '10+';
  isDemo?: boolean;
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: VestaUser | null;
  onLogOut: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogOut }: SidebarProps) {
  const tabs = [
    { id: 'catalog', label: 'Archivio', index: '01', icon: Layers },
    { id: 'new-listing', label: 'Nuovo Annuncio', index: '02', icon: PlusCircle },
    { id: 'templates', label: 'Modelli Scrittura', index: '03', icon: FileText },
    { id: 'settings', label: 'Impostazioni', index: '04', icon: Sliders },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR: Visible on medium and larger screens */}
      <aside 
        id="vesta-sidebar"
        className="hidden md:flex w-72 h-screen bg-[#FAF6F0] text-[#2C3E35] flex-col justify-between border-r border-[#FAF6F0] select-none shrink-0 antialiased font-sans font-medium"
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#F5EFEB]/80">
          <div className="flex flex-col space-y-2">
            <Logo type="full" size="md" className="h-9" />
            <div className="text-[9px] text-[#1B3B2B]/70 tracking-widest font-mono uppercase pl-1 font-semibold">
              COGNITIVE ANALYST v5.0
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-3 text-[10px] font-bold text-[#1B3B2B]/50 uppercase tracking-widest font-sans">
            Operazioni Principali
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#1B3B2B] font-bold shadow-sm'
                    : 'text-[#2C3E35]/70 hover:bg-[#F5EFEB]/50 hover:text-[#1B3B2B]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-[#1B3B2B]' : 'text-[#1B3B2B]/40 group-hover:text-[#1B3B2B]/80'
                  }`} />
                  <span className="text-sm tracking-tight font-medium label-sidebar">{tab.label}</span>
                </div>
                <span className="font-mono text-[9px] text-[#1B3B2B]/30">
                  {tab.index}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Account Details Section (Requested feature display) */}
        {user && (
          <div className="mx-4 mb-3 p-4 bg-white border border-[#F5EFEB] rounded-xl flex flex-col space-y-3 shadow-xs">
            <div className="flex items-center space-x-2.5 border-b border-[#FAF6F0] pb-2">
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1B3B2B] shrink-0 font-bold text-xs uppercase">
                {user.agencyName.substring(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-[#1B3B2B] shrink-0" />
                  <h4 className="text-xs font-bold text-[#1B3B2B] truncate">{user.agencyName}</h4>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-[10px] text-[#2C3E35]/70 truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono">
              <div className="flex items-center space-x-1 text-[#2C3E35]/70">
                <Users className="w-3.5 h-3.5 text-[#1B3B2B]/75" />
                <span>Team: <b>{user.collaborators}</b></span>
              </div>
              
              <button
                type="button"
                onClick={onLogOut}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:underline transition font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ESCI</span>
              </button>
            </div>
          </div>
        )}

        {/* Quality Indicator Footer */}
        <div className="p-4 bg-[#F5EFEB]/30 border-t border-[#F5EFEB]/80 font-mono text-[10px] text-[#1B3B2B]/60">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold">VESTA ENGINE</span>
            <span className="text-[#1B3B2B] font-bold">● ONLINE</span>
          </div>
          <div className="flex justify-between items-center text-[9px]">
            <span>THEME ACCENT</span>
            <span className="font-semibold uppercase tracking-wider">FOREST GREEN</span>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR: Visible on small screens, fixed to bottom */}
      <nav 
        id="vesta-mobile-bottombar"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FAF6F0] border-t border-[#F5EFEB] z-40 flex justify-around items-center px-2 pb-safe no-print shadow-[0_-4px_12px_rgba(7,40,20,0.04)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
                isActive 
                  ? 'text-[#1B3B2B]' 
                  : 'text-[#2C3E35]/50 hover:text-[#1B3B2B]/80'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isActive ? 'bg-[#E8F5E9]' : 'bg-transparent'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 font-semibold tracking-tight leading-none block">
                {tab.label.split(' ')[0]} {/* Use first word for brevity */}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

