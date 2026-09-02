import React, { useEffect, useRef } from 'react';

/**
 * 画面の上に重ねる小窓（モーダル）の共通部品。
 *
 * フッターの3つの小窓（運営者情報・プライバシーポリシー・クッキーポリシー）と、
 * LINE割引のご案内が、どちらもここを通ります。
 * 前は開く側それぞれに書いていたので、足りないものが半分ずつ違っていました。
 * ここでまとめて面倒を見るのは、次の6つです。
 *
 * 1. 開いている間だけ、後ろのページのスクロールを止める（閉じたら元に戻す）
 * 2. Escape キーで閉じる
 * 3. 開いたら、小窓の中の最初の操作できるところへ焦点を移す
 * 4. Tab / Shift+Tab の焦点が、小窓の外に出ていかないようにする
 * 5. 閉じたら、開く前にいた場所へ焦点を戻す
 * 6. 背景（暗いところ）を押したら閉じる
 *
 * 器の大きさや中の並べ方は、中身ごとに違うので外から渡します（panelClassName）。
 * ここが持つ見た目は「暗い背景」と「白い面・1pxの線・8pxの角丸」だけです。
 */

/** 焦点を当てられるものの並び。焦点の閉じ込めと初期移動に使います。 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  /** 閉じるときに呼ばれます。背景クリック・Escape・中の閉じるボタンから来ます。 */
  onClose: () => void;
  /** 見出しの id。読み上げに「何の小窓か」を伝えます。 */
  labelledBy?: string;
  /** 器の大きさと並べ方。中身ごとに違うので外から渡します。 */
  panelClassName?: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ onClose, labelledBy, panelClassName = '', children }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // 1. 背景のスクロール止め。
  //    戻すときは 'auto' ではなく空文字にします。'auto' を入れると
  //    index.html の <body class="... overflow-x-hidden"> まで打ち消してしまい、
  //    一度開け閉てしただけで、そのページの横スクロール止めが効かなくなります。
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 3 と 5. 焦点の初期移動と、閉じたあとの復帰。
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();
    return () => {
      opener?.focus?.();
    };
  }, []);

  // 2 と 4. Escape で閉じる。Tab の行き先を小窓の中に閉じ込める。
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !(active instanceof Node) || !panel.contains(active);

      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/60 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`rounded border border-hairline bg-surface ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
