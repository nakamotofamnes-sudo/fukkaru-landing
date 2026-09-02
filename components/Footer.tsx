import React, { useState } from 'react';
import { X, Youtube, Instagram, Music, AtSign, MessageCircle, FileText } from 'lucide-react';

type ModalType = 'operator' | 'privacy' | 'cookie' | null;

interface FooterProps {
  onNavigate: (view: 'home' | 'consultation', hash?: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    document.body.style.overflow = 'hidden'; // 背景スクロール固定
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = 'auto'; // 解除
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    onNavigate('home', hash);
  };

  const Modal: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    if (!activeModal) return null;
    return (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="font-bold text-xl text-gray-800">{title}</h3>
            <button 
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto text-gray-600 text-sm leading-relaxed space-y-4">
            {children}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
            <button 
              onClick={closeModal}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  };

  // SEOタグリスト（網戸張替えは除外）
  const tags = [
    "富士市 物置設置", "富士市 物置移動", "富士市 草むしり", "富士市 草刈り",
    "富士市 防草シート施工", "富士市 庭木剪定", "富士市 庭の片付け", 
    "富士市 障子張替え", "富士市 襖張替え", "富士市 高圧洗浄", "富士市 ベランダ清掃",
    "富士市 排水溝清掃", "富士市 家具組み立て", "富士市 家具移動", 
    "富士市 不用品 運搬", "富士市 不用品 買取", "富士市 粗大ゴミ搬出", "富士市 引越し手伝い",
    "富士市 片付けサポート", "富士市 ハウスクリーニング", "富士市 買い物代行",
    "富士市 送迎代行", "富士市 並び代行", "富士市 付き添いサービス",
    "富士市 立ち会い代行", "富士市 内見代行", "富士市 写真・動画レポート",
    "富士市 空き家管理", "富士市 空き家見回り", "富士市 通風・換気", 
    "富士市 室内チェック", "HP作成", "パソコン設定", "スマホ設定", 
    "Wi-Fi設定", "SNSサポート"
  ];

  return (
    <>
      <footer className="bg-gray-800 text-gray-300 mobile-section pb-24 md:pb-12">
        <div className="container mx-auto mobile-px">
          <div className="grid grid-cols-1 md:grid-cols-3 mobile-gap mb-8 border-b border-gray-700 pb-8">
            
            {/* Company Info */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <img 
                  src="https://res.cloudinary.com/dyclm0vti/image/upload/v1772689454/%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3_%E3%83%AD%E3%82%B3%E3%82%99%E3%83%95%E3%83%83%E8%BB%BD_le0bo3.png" 
                  alt="フッ軽 ロゴ" 
                  className="w-12 h-12 object-contain bg-white rounded-full p-1"
                />
                <div>
                  <span className="block text-sm text-gray-400 mb-1">フッ軽合同会社</span>
                  <h3 className="text-white font-bold text-lg sm:text-xl">
                    フッ軽 <span className="text-sm font-normal text-gray-400 ml-2">フッカル/富士市の便利屋</span>
                  </h3>
                </div>
              </div>
              <p className="mb-4">〒417-0855<br/>静岡県富士市三ツ沢 390-9</p>
              
              <p className="mb-4 text-sm text-gray-400 leading-relaxed">
                【法人情報】<br />
                法人番号：6080103003564<br />
                インボイス登録番号：T6080103003564<br />
                <br />
                【貨物軽自動車運送事業】<br />
                事業者名：フッ軽合同会社<br />
                事業用自動車（黒ナンバー）：<br />
                富士山481 り4082<br />
                富士山481 り4074<br />
                営業区域：静岡県<br />
                安全管理者：中元晋平<br />
                <br />
                【古物商許可証】<br />
                静岡県公安委員会<br />
                第49110A000757号
              </p>
              
              {/* SNS Links */}
              <div className="flex flex-wrap items-center gap-4">
                <a href="https://youtube.com/@fukkaru_fuji-benriya" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors" title="YouTube">
                  <Youtube size={24} />
                </a>
                <a href="https://tiktok.com/@fukkaru_fuji?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="TikTok">
                  <Music size={24} />
                </a>
                <a href="https://instagram.com/fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" title="Instagram">
                  <Instagram size={24} />
                </a>
                <a href="https://threads.net/@fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Threads">
                  <AtSign size={24} />
                </a>
                <a href="https://lin.ee/qXlO1gC" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#06C755] transition-colors" title="LINE">
                  <MessageCircle size={24} />
                </a>
                <a href="https://note.com/fukkaru_co_jp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors" title="note">
                  <FileText size={24} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold mb-3">メニュー</h4>
              <ul className="space-y-1">
                <li><a href="#problems" onClick={(e) => handleLinkClick(e, '#problems')} className="hover:text-brand-orange">お悩み解決</a></li>
                <li><a href="#services" onClick={(e) => handleLinkClick(e, '#services')} className="hover:text-brand-orange">サービス一覧</a></li>
                <li><a href="#reservation" onClick={(e) => handleLinkClick(e, '#reservation')} className="hover:text-brand-orange">Web予約</a></li>
                <li><a href="#reasons" onClick={(e) => handleLinkClick(e, '#reasons')} className="hover:text-brand-orange">選ばれる理由</a></li>
                <li><a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')} className="hover:text-brand-orange">お問い合わせ</a></li>
                <li><a href="/blog/" className="hover:text-brand-orange">お役立ちブログ</a></li>
              </ul>
            </div>

            {/* SEO Keywords Area */}
            <div>
              <h4 className="text-white font-bold mb-3">対応エリア・業務</h4>
              <div className="flex flex-wrap gap-1 text-xs">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mobile-gap text-sm opacity-70">
            <div className="flex gap-4 flex-wrap justify-center">
              <button onClick={() => openModal('operator')} className="hover:text-white hover:underline">運営者情報</button>
              <button onClick={() => openModal('privacy')} className="hover:text-white hover:underline">プライバシーポリシー</button>
              <button onClick={() => openModal('cookie')} className="hover:text-white hover:underline">クッキーポリシー</button>
            </div>
            <div className="text-center md:text-right">
              &copy; {new Date().getFullYear()} フッ軽合同会社. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeModal === 'operator' && (
        <Modal title="運営者情報">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="font-bold text-gray-800">会社名</div>
              <div className="sm:col-span-2">フッ軽合同会社</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="font-bold text-gray-800">代表</div>
              <div className="sm:col-span-2">中元 晋平</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="font-bold text-gray-800">所在地</div>
              <div className="sm:col-span-2">〒417-0855 静岡県富士市三ツ沢 390-9</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="font-bold text-gray-800">電話番号</div>
              <div className="sm:col-span-2">0545-78-3704</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="font-bold text-gray-800">メール</div>
              <div className="sm:col-span-2">
                <a href="mailto:nakamoto.famnes@gmail.com" className="text-brand-orange hover:underline">nakamoto.famnes@gmail.com</a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
              <div className="font-bold text-gray-800">事業内容</div>
              <div className="sm:col-span-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>住まいのトラブル解決（修繕、メンテナンス）</li>
                  <li>庭仕事・外構（草むしり、剪定、物置設置）</li>
                  <li>ITサポート・Web制作</li>
                  <li>不動産サポート（空き家管理、内見代行）</li>
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'privacy' && (
        <Modal title="プライバシーポリシー">
          <h4 className="font-bold text-gray-800 mb-2">1. 個人情報の利用目的</h4>
          <p className="mb-4">
            当方は、お客様から収集した個人情報を、お問い合わせへの回答、サービスの提供、および当方のサービス向上を目的として利用いたします。
            法令に基づく場合を除き、お客様の同意なく第三者に提供することはありません。
          </p>
          
          <h4 className="font-bold text-gray-800 mb-2">2. 個人情報の管理</h4>
          <p className="mb-4">
            当方は、お客様の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、
            セキュリティシステムの維持・管理体制の整備等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。
          </p>

          <h4 className="font-bold text-gray-800 mb-2">3. 個人情報の第三者への開示・提供の禁止</h4>
          <p className="mb-4">
            当方は、お客さまよりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者に開示いたしません。
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>お客さまの同意がある場合</li>
            <li>お客さまが希望されるサービスを行なうために当方が業務を委託する業者に対して開示する場合</li>
            <li>法令に基づき開示することが必要である場合</li>
          </ul>

          <h4 className="font-bold text-gray-800 mb-2">4. ご本人の照会</h4>
          <p className="mb-4">
            お客さまがご本人の個人情報の照会・修正・削除などをご希望される場合には、ご本人であることを確認の上、対応させていただきます。
          </p>

          <h4 className="font-bold text-gray-800 mb-2">5. お問い合わせ窓口</h4>
          <p>
            本ポリシーに関するお問い合わせは、当サイトのお問い合わせフォームまたはお電話にてお願いいたします。
          </p>
        </Modal>
      )}

      {activeModal === 'cookie' && (
        <Modal title="クッキーポリシー">
          <p className="mb-4">
            当サイトでは、サービスの向上およびお客様により適したサービスを提供するため、Cookie（クッキー）を使用しています。
            Cookieとは、お客様がWebサイトを閲覧した際に、お客様のブラウザに保存される小さなデータファイルのことです。
          </p>
          
          <h4 className="font-bold text-gray-800 mb-2">1. 使用するCookieの種類</h4>
          <p className="mb-4">
            当サイトでは、主にアクセス解析ツール（Google Analytics等）を利用して、サイトの利用状況を把握するためにCookieを使用する場合があります。
            これにより収集される情報は匿名であり、個人を特定するものではありません。
          </p>

          <h4 className="font-bold text-gray-800 mb-2">2. Cookieの無効化</h4>
          <p>
            お客様は、ブラウザの設定を変更することでCookieを無効にすることができます。
            ただし、Cookieを無効にした場合、当サイトの一部の機能が正常に動作しない可能性がありますのでご注意ください。
          </p>
        </Modal>
      )}
    </>
  );
};

export default Footer;