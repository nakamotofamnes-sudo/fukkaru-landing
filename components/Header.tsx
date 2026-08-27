import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, HelpCircle, Wrench, Calendar, Star, User, FileText, Users, Youtube, Instagram, Music, AtSign } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'consultation';
  onNavigate: (view: 'home' | 'consultation', hash?: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'お悩み', href: '#problems', icon: <HelpCircle size={16} /> },
    { name: 'サービス', href: '#services', icon: <Wrench size={16} /> },
    { name: '協力会社一覧', href: '#partners', icon: <Users size={16} /> },
    { name: 'Web予約', href: '#reservation', icon: <Calendar size={16} /> },
    { name: '実績', href: '#testimonials', icon: <Star size={16} /> },
    { name: '代表挨拶', href: '#founder', icon: <User size={16} /> },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      onNavigate('home', href);
    } else {
      // External links or otherwise
      onNavigate('home');
    }
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('home');
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || currentView === 'consultation' ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo Area */}
        <a 
          href="#" 
          onClick={handleLogoClick}
          className={`flex flex-row items-center gap-2 group transition-colors text-[10px] md:text-xs font-medium tracking-wider leading-none mb-0.5 opacity-90 ${
            isScrolled || currentView === 'consultation' ? 'text-brand-blue' : 'text-brand-blue md:text-white md:drop-shadow-md'
          }`}
        >
          <img 
            src="https://res.cloudinary.com/dyclm0vti/image/upload/v1772689454/%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3_%E3%83%AD%E3%82%B3%E3%82%99%E3%83%95%E3%83%83%E8%BB%BD_le0bo3.png" 
            alt="フッ軽 ロゴ" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          <div className="flex flex-col items-start">
            <span className="text-[10px] md:text-xs font-medium tracking-wider leading-none mb-0.5 opacity-90">フッ軽合同会社</span>
            <span className="font-bold text-xl md:text-2xl leading-none">フッ軽</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex flex-1 justify-end items-center gap-2 xl:gap-4 pl-4 shrink-0 overflow-hidden">
          <div className="flex items-center gap-2 xl:gap-5 px-2">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (!link.external) {
                    handleNavClick(e, link.href);
                  }
                }}
                className={`font-semibold hover:text-brand-orange transition-colors flex items-center gap-1 text-[13px] xl:text-[15px] max-w-fit shrink-0 whitespace-nowrap ${
                  isScrolled || currentView === 'consultation' ? 'text-gray-800' : 'text-white drop-shadow-md'
                }`}
              >
                {link.icon}
                {link.name}
              </a>
            ))}
          </div>
          
          {/* SNS Icons (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 border-l border-white/20 pl-4 shrink-0">
            <a href="https://youtube.com/@fukkaru_fuji-benriya" target="_blank" rel="noopener noreferrer" className={`hover:text-red-500 transition-colors ${isScrolled || currentView === 'consultation' ? 'text-gray-600' : 'text-white'}`}><Youtube size={20} className="w-[18px] h-[18px] xl:w-[22px] xl:h-[22px]" /></a>
            <a href="https://tiktok.com/@fukkaru_fuji?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className={`hover:text-gray-900 transition-colors ${isScrolled || currentView === 'consultation' ? 'text-gray-600' : 'text-white'}`}><Music size={20} className="w-[18px] h-[18px] xl:w-[22px] xl:h-[22px]" /></a>
            <a href="https://instagram.com/fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className={`hover:text-pink-500 transition-colors ${isScrolled || currentView === 'consultation' ? 'text-gray-600' : 'text-white'}`}><Instagram size={20} className="w-[18px] h-[18px] xl:w-[22px] xl:h-[22px]" /></a>
            <a href="https://threads.net/@fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className={`hover:text-gray-900 transition-colors ${isScrolled || currentView === 'consultation' ? 'text-gray-600' : 'text-white'}`}><AtSign size={20} className="w-[18px] h-[18px] xl:w-[22px] xl:h-[22px]" /></a>
            <a href="https://note.com/fukkaru_co_jp" target="_blank" rel="noopener noreferrer" className={`hover:text-green-500 transition-colors ${isScrolled || currentView === 'consultation' ? 'text-gray-600' : 'text-white'}`}><FileText size={20} className="w-[18px] h-[18px] xl:w-[22px] xl:h-[22px]" /></a>
          </div>

          <div className="flex items-center gap-2 ml-2 shrink-0">
            <a 
              href="https://lin.ee/Bh5gFU6"
              className="bg-brand-green hover:bg-green-600 text-white px-3 py-2 xl:px-5 xl:py-2.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1 text-[13px] xl:text-[15px] whitespace-nowrap break-keep"
            >
              <MessageCircle size={16} className="xl:w-[18px] xl:h-[18px]" />
              LINE相談
            </a>
            <a 
              href="tel:0545-78-3704"
              className="bg-brand-orange hover:bg-orange-600 text-white px-3 py-2 xl:px-5 xl:py-2.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1 text-[13px] xl:text-[15px] whitespace-nowrap break-keep"
            >
              <Phone size={16} className="xl:w-[18px] xl:h-[18px]" />
              電話相談
            </a>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X size={28} className={isScrolled || currentView === 'consultation' ? 'text-gray-800' : 'text-white'} />
          ) : (
            <Menu size={28} className={isScrolled || currentView === 'consultation' ? 'text-gray-800' : 'text-white drop-shadow-md'} />
          )}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col mobile-gap">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-gray-800 font-medium py-3 border-b border-gray-100 flex items-center gap-3"
              onClick={(e) => {
                if (!link.external) {
                  handleNavClick(e, link.href);
                } else {
                  setIsMenuOpen(false);
                }
              }}
            >
              <span className="text-brand-blue">{link.icon}</span>
              {link.name}
            </a>
          ))}

          {/* SNS Icons (Mobile) */}
          <div className="flex justify-center flex-wrap gap-4 py-4 border-b border-gray-100">
            <a href="https://youtube.com/@fukkaru_fuji-benriya" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-500"><Youtube size={26} /></a>
            <a href="https://tiktok.com/@fukkaru_fuji?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900"><Music size={26} /></a>
            <a href="https://instagram.com/fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500"><Instagram size={26} /></a>
            <a href="https://threads.net/@fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900"><AtSign size={26} /></a>
            <a href="https://note.com/fukkaru_co_jp" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500"><FileText size={26} /></a>
          </div>

          <div className="flex flex-col mobile-gap pt-4">
            <a 
              href="https://lin.ee/Bh5gFU6"
              className="bg-brand-green text-white text-center py-3 rounded-lg font-bold w-full flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              LINEで無料相談
            </a>
            <a 
              href="tel:0545-78-3704"
              className="bg-brand-orange text-white text-center py-3 rounded-lg font-bold w-full flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              電話で相談
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;