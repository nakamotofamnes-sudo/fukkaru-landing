import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, Youtube, Instagram, Music2, AtSign, FileText } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'consultation';
  onNavigate: (view: 'home' | 'consultation', hash?: string) => void;
}

// 並びは「見に来た人が知りたい順」。アイコンは付けません。
// 文字だけのほうが、迷いなく読めます。
const navLinks = [
  { name: 'お悩み', href: '#problems' },
  { name: 'サービス・料金', href: '#services' },
  { name: 'ご利用の流れ', href: '#flow' },
  { name: 'お客様の声', href: '#testimonials' },
  { name: '代表挨拶', href: '#founder' },
  { name: 'ブログ', href: '/blog/', external: true },
];

const socials = [
  { label: 'YouTube', href: 'https://youtube.com/@fukkaru_fuji-benriya', Icon: Youtube },
  { label: 'TikTok', href: 'https://tiktok.com/@fukkaru_fuji?is_from_webapp=1&sender_device=pc', Icon: Music2 },
  { label: 'Instagram', href: 'https://instagram.com/fukkaru.fuji.benriya', Icon: Instagram },
  { label: 'Threads', href: 'https://threads.net/@fukkaru.fuji.benriya', Icon: AtSign },
  { label: 'note', href: 'https://note.com/fukkaru_co_jp', Icon: FileText },
];

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ヒーローの上に重なっている間だけ透明。それ以外は白い帯に1pxの線。
  const solid = isScrolled || isMenuOpen || currentView === 'consultation';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigate('home', href);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        solid ? 'bg-surface/95 backdrop-blur border-b border-hairline' : 'bg-transparent'
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        {/* ロゴ */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <img
            src="https://res.cloudinary.com/dyclm0vti/image/upload/v1772689454/%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3_%E3%83%AD%E3%82%B3%E3%82%99%E3%83%95%E3%83%83%E8%BB%BD_le0bo3.png"
            alt=""
            className="h-8 w-8 object-contain"
          />
          <span className="flex flex-col leading-none">
            <span className={`text-[10px] font-medium tracking-[0.08em] ${solid ? 'text-ink-500' : 'text-white/70'}`}>
              フッ軽合同会社
            </span>
            <span className={`mt-1 text-lg font-bold tracking-tight ${solid ? 'text-ink-900' : 'text-white'}`}>
              フッ軽
            </span>
          </span>
        </a>

        {/* デスクトップのメニュー */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={link.external ? undefined : (e) => handleNavClick(e, link.href)}
              className={`text-[14px] font-medium whitespace-nowrap transition-colors ${
                solid ? 'text-ink-600 hover:text-ink-900' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-3 pr-3 mr-1 border-r ${solid ? 'border-hairline' : 'border-white/20'}`}>
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`transition-colors ${solid ? 'text-ink-500 hover:text-ink-900' : 'text-white/60 hover:text-white'}`}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <a href="tel:0545-78-3704" className={`btn text-[14px] px-4 py-2 ${solid ? 'btn-outline' : 'border border-white/30 text-white hover:bg-white/10'}`}>
            <Phone size={16} />
            0545-78-3704
          </a>
          <a href="https://lin.ee/Bh5gFU6" className="btn btn-line text-[14px] px-4 py-2">
            <MessageCircle size={16} />
            LINEで相談
          </a>
        </div>

        {/* スマホのメニューボタン */}
        <button
          className={`lg:hidden -mr-2 p-2 ${solid ? 'text-ink-900' : 'text-white'}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* スマホのメニュー */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-hairline bg-surface animate-fade-in">
          <nav className="shell py-2 rule-list flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={link.external ? () => setIsMenuOpen(false) : (e) => handleNavClick(e, link.href)}
                className="py-3.5 text-[15px] font-medium text-ink-800"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="shell pb-6 pt-2 space-y-3">
            <a href="https://lin.ee/Bh5gFU6" className="btn btn-line w-full">
              <MessageCircle size={18} />
              LINEで無料相談
            </a>
            <a href="tel:0545-78-3704" className="btn btn-outline w-full">
              <Phone size={18} />
              0545-78-3704 に電話する
            </a>
            <div className="flex items-center gap-5 pt-2">
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-ink-500 hover:text-ink-900">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
