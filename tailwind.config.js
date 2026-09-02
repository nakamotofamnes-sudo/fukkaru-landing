/** @type {import('tailwindcss').Config} */
//
// デザインの土台（Design Tokens）。
// ここに無い色・角丸・影は、原則どのコンポーネントでも使いません。
// 種類を絞ることが、サイト全体の「そろって見える」感じを作ります。
//
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    // 角丸は8pxの1種類だけ。extend に足すと標準の rounded-sm（2px）などが
    // 生き残ってしまうので、ここで丸ごと置き換えています。
    // none と full は実際に使うので必ず残します
    // （full はお客様の声のアバターと、送信後のチェック印）。
    borderRadius: {
      none: '0',
      DEFAULT: '8px',
      md: '8px',
      lg: '8px',
      xl: '8px',
      '2xl': '8px',
      '3xl': '8px',
      full: '9999px',
    },
    extend: {
      colors: {
        // 面と線。白は「カード」にだけ使い、地色はわずかに灰を混ぜた白にします。
        canvas: '#F8FAFC',   // ページの地色
        surface: '#FFFFFF',  // カードの面
        hairline: '#E2E8F0', // 1pxの線
        // 文字と濃い面。黒ではなく、青みのある濃紺グレー。
        ink: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          100: '#F1F5F9',
        },
        // 差し色はこの1色だけ。原色の黄色ではなく、深みのある琥珀。
        accent: {
          DEFAULT: '#B45309',
          hover: '#92400E',
          soft: '#FEF3C7',   // 淡い面（チップの背景など）
          line: '#FDE68A',   // 淡い面のふち
        },
        // LINEの緑は「LINEのボタン」だと分かることに意味があるので残します。
        // ただし白文字が読めるところまで暗くしてあります。
        line: {
          DEFAULT: '#0A8138',
          hover: '#08682D',
        },
        // 旧クラス名がどこかに残っていても崩れないように残す別名。
        brand: {
          blue: '#0F172A',
          orange: '#B45309',
          green: '#0A8138',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Noto Sans JP"',
          '-apple-system',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          'Meiryo',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      boxShadow: {
        // 影は使いません。段差はすべて1pxの線で表します。
        none: 'none',
      },
      maxWidth: {
        prose: '68ch',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-bg': 'slideBg 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideBg: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      }
    }
  },
  plugins: [],
}
