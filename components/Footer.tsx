import React, { useCallback, useState } from 'react';
import { X, Youtube, Instagram, Music2, AtSign, MessageCircle, FileText } from 'lucide-react';
import Modal from './Modal';

type ModalType = 'operator' | 'privacy' | 'cookie' | null;

/**
 * フッターの3つの小窓は、見出し・本文・閉じるボタンの形がそろっています。
 * スクロール止めや焦点まわりの世話は、共通部品の Modal がまとめて見ます。
 */
const InfoModal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <Modal
    onClose={onClose}
    labelledBy="footer-modal-title"
    panelClassName="flex max-h-[80vh] w-full max-w-2xl flex-col"
  >
    <div className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-4">
      <h3 id="footer-modal-title" className="text-[17px] font-bold tracking-tight text-ink-900">
        {title}
      </h3>
      <button
        onClick={onClose}
        aria-label="閉じる"
        className="-mr-2 rounded p-2 text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
      >
        <X size={18} />
      </button>
    </div>
    <div className="space-y-4 overflow-y-auto px-6 py-6 text-[14px] leading-[1.9] text-ink-600">
      {children}
    </div>
    <div className="flex justify-end border-t border-hairline px-6 py-4">
      <button onClick={onClose} className="btn btn-outline">
        閉じる
      </button>
    </div>
  </Modal>
);

interface FooterProps {
  onNavigate: (hash?: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    onNavigate(hash);
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
      <footer className="bg-ink-900 text-ink-400 pt-16 pb-28 md:pb-16">
        <div className="shell">
          <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-3">
            
            {/* Company Info */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <img 
                  src="https://res.cloudinary.com/dyclm0vti/image/upload/v1772689454/%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3_%E3%83%AD%E3%82%B3%E3%82%99%E3%83%95%E3%83%83%E8%BB%BD_le0bo3.png" 
                  alt="フッ軽 ロゴ" 
                  className="h-10 w-10 rounded bg-white object-contain p-1"
                />
                <div>
                  <span className="block text-[11px] tracking-[0.08em] text-white/65">フッ軽合同会社</span>
                  <h3 className="mt-1 text-[18px] font-bold tracking-tight text-white">
                    フッ軽 <span className="ml-2 text-[12px] font-normal text-white/65">フッカル/富士市の便利屋</span>
                  </h3>
                </div>
              </div>
              <p className="mb-5 text-[13px] leading-[1.9]">〒417-0855<br/>静岡県富士市三ツ沢 390-9</p>
              
              <p className="mb-6 text-[12px] leading-[1.9] text-white/60">
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
              <div className="flex flex-wrap items-center gap-5">
                <a href="https://youtube.com/@fukkaru_fuji-benriya" target="_blank" rel="noopener noreferrer" className="text-white/65 transition-colors hover:text-white" title="YouTube">
                  <Youtube size={20} />
                </a>
                <a href="https://tiktok.com/@fukkaru_fuji?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-white/65 transition-colors hover:text-white" title="TikTok">
                  <Music2 size={20} />
                </a>
                <a href="https://instagram.com/fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className="text-white/65 transition-colors hover:text-white" title="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://threads.net/@fukkaru.fuji.benriya" target="_blank" rel="noopener noreferrer" className="text-white/65 transition-colors hover:text-white" title="Threads">
                  <AtSign size={20} />
                </a>
                <a href="https://lin.ee/qXlO1gC" target="_blank" rel="noopener noreferrer" className="text-white/65 transition-colors hover:text-white" title="LINE">
                  <MessageCircle size={20} />
                </a>
                <a href="https://note.com/fukkaru_co_jp" target="_blank" rel="noopener noreferrer" className="text-white/65 transition-colors hover:text-white" title="note">
                  <FileText size={20} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="mb-4 text-[12px] font-semibold tracking-[0.08em] text-white/65">メニュー</h4>
              <ul className="space-y-2.5 text-[14px]">
                <li><a href="#problems" onClick={(e) => handleLinkClick(e, '#problems')} className="transition-colors hover:text-white">お悩み解決</a></li>
                <li><a href="#services" onClick={(e) => handleLinkClick(e, '#services')} className="transition-colors hover:text-white">サービス一覧</a></li>
                <li><a href="#reservation" onClick={(e) => handleLinkClick(e, '#reservation')} className="transition-colors hover:text-white">Web予約</a></li>
                <li><a href="#reasons" onClick={(e) => handleLinkClick(e, '#reasons')} className="transition-colors hover:text-white">選ばれる理由</a></li>
                <li><a href="#partners" onClick={(e) => handleLinkClick(e, '#partners')} className="transition-colors hover:text-white">協力会社</a></li>
                <li><a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')} className="transition-colors hover:text-white">お問い合わせ</a></li>
                <li><a href="/blog/" className="transition-colors hover:text-white">お役立ちブログ</a></li>
              </ul>
            </div>

            {/* SEO Keywords Area */}
            <div>
              <h4 className="mb-4 text-[12px] font-semibold tracking-[0.08em] text-white/65">対応エリア・業務</h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, index) => (
                  <span key={index} className="rounded border border-white/10 px-2 py-1 text-[11px] text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-5 pt-8 text-[13px] text-white/60 md:flex-row">
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => openModal('operator')} className="transition-colors hover:text-white">運営者情報</button>
              <button onClick={() => openModal('privacy')} className="transition-colors hover:text-white">プライバシーポリシー</button>
              <button onClick={() => openModal('cookie')} className="transition-colors hover:text-white">クッキーポリシー</button>
            </div>
            <div className="text-center md:text-right">
              &copy; {new Date().getFullYear()} フッ軽合同会社. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeModal === 'operator' && (
        <InfoModal title="運営者情報" onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 border-b border-hairline pb-4 sm:grid-cols-3 sm:gap-4">
              <div className="font-semibold text-ink-900">会社名</div>
              <div className="sm:col-span-2">フッ軽合同会社</div>
            </div>
            <div className="grid grid-cols-1 gap-2 border-b border-hairline pb-4 sm:grid-cols-3 sm:gap-4">
              <div className="font-semibold text-ink-900">代表</div>
              <div className="sm:col-span-2">中元 晋平</div>
            </div>
            <div className="grid grid-cols-1 gap-2 border-b border-hairline pb-4 sm:grid-cols-3 sm:gap-4">
              <div className="font-semibold text-ink-900">所在地</div>
              <div className="sm:col-span-2">〒417-0855 静岡県富士市三ツ沢 390-9</div>
            </div>
            <div className="grid grid-cols-1 gap-2 border-b border-hairline pb-4 sm:grid-cols-3 sm:gap-4">
              <div className="font-semibold text-ink-900">電話番号</div>
              <div className="sm:col-span-2">0545-78-3704</div>
            </div>
            <div className="grid grid-cols-1 gap-2 border-b border-hairline pb-4 sm:grid-cols-3 sm:gap-4">
              <div className="font-semibold text-ink-900">メール</div>
              <div className="sm:col-span-2">
                <a href="mailto:nakamoto.famnes@gmail.com" className="text-accent hover:underline">nakamoto.famnes@gmail.com</a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 border-b border-hairline pb-4 sm:grid-cols-3 sm:gap-4">
              <div className="font-semibold text-ink-900">事業内容</div>
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
        </InfoModal>
      )}

      {activeModal === 'privacy' && (
        <InfoModal title="プライバシーポリシー" onClose={closeModal}>
          <h4 className="font-semibold text-ink-900">1. 個人情報の利用目的</h4>
          <p className="mb-4">
            当方は、お客様から収集した個人情報を、お問い合わせへの回答、サービスの提供、および当方のサービス向上を目的として利用いたします。
            法令に基づく場合を除き、お客様の同意なく第三者に提供することはありません。
          </p>
          
          <h4 className="font-semibold text-ink-900">2. 個人情報の管理</h4>
          <p className="mb-4">
            当方は、お客様の個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、
            セキュリティシステムの維持・管理体制の整備等の必要な措置を講じ、安全対策を実施し個人情報の厳重な管理を行ないます。
          </p>

          <h4 className="font-semibold text-ink-900">3. 個人情報の第三者への開示・提供の禁止</h4>
          <p className="mb-4">
            当方は、お客さまよりお預かりした個人情報を適切に管理し、次のいずれかに該当する場合を除き、個人情報を第三者に開示いたしません。
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>お客さまの同意がある場合</li>
            <li>お客さまが希望されるサービスを行なうために当方が業務を委託する業者に対して開示する場合</li>
            <li>法令に基づき開示することが必要である場合</li>
          </ul>

          <h4 className="font-semibold text-ink-900">4. ご本人の照会</h4>
          <p className="mb-4">
            お客さまがご本人の個人情報の照会・修正・削除などをご希望される場合には、ご本人であることを確認の上、対応させていただきます。
          </p>

          <h4 className="font-semibold text-ink-900">5. お問い合わせ窓口</h4>
          <p>
            本ポリシーに関するお問い合わせは、当サイトのお問い合わせフォームまたはお電話にてお願いいたします。
          </p>
        </InfoModal>
      )}

      {activeModal === 'cookie' && (
        <InfoModal title="クッキーポリシー" onClose={closeModal}>
          <p className="mb-4">
            当サイトでは、サービスの向上およびお客様により適したサービスを提供するため、Cookie（クッキー）を使用しています。
            Cookieとは、お客様がWebサイトを閲覧した際に、お客様のブラウザに保存される小さなデータファイルのことです。
          </p>
          
          <h4 className="font-semibold text-ink-900">1. 使用するCookieの種類</h4>
          <p className="mb-4">
            当サイトでは、主にアクセス解析ツール（Google Analytics等）を利用して、サイトの利用状況を把握するためにCookieを使用する場合があります。
            これにより収集される情報は匿名であり、個人を特定するものではありません。
          </p>

          <h4 className="font-semibold text-ink-900">2. Cookieの無効化</h4>
          <p>
            お客様は、ブラウザの設定を変更することでCookieを無効にすることができます。
            ただし、Cookieを無効にした場合、当サイトの一部の機能が正常に動作しない可能性がありますのでご注意ください。
          </p>
        </InfoModal>
      )}
    </>
  );
};

export default Footer;