/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Noto Serif', 'Georgia', 'serif'],
                body: ['Manrope', 'Inter', 'sans-serif'],
            },
            colors: {
                // ── Aurelian Minimal tokens — resolve via CSS vars ──
                // These automatically switch between light & dark values
                primary: 'var(--color-primary)',
                'primary-light': 'var(--color-primary-light)',
                'primary-fixed': 'var(--color-primary-container)',
                secondary: 'var(--color-text-muted)',
                'secondary-container': 'var(--color-champagne)',
                surface: 'var(--color-surface)',
                'surface-low': 'var(--color-surface-low)',
                'surface-card': 'var(--color-card)',
                'surface-mid': 'var(--color-surface-mid)',
                'on-surface': 'var(--color-text)',
                'on-surface-variant': 'var(--color-text-muted)',
                outline: 'var(--color-text-faint)',
                'outline-variant': 'var(--color-border-strong)',

                // ── Legacy aliases — wired to CSS vars ──────────────
                // bg-background-dark → theme bg
                'background-dark': 'var(--color-bg)',
                // bg-surface-dark → theme card
                'surface-dark': 'var(--color-card)',
                // bg-surface-darker → slightly deeper
                'surface-darker': 'var(--color-surface-low)',
                // border/text legacy
                'border-dark': 'var(--color-border)',
                'text-secondary': 'var(--color-text-muted)',
                // brand aliases
                'brand-bg': 'var(--color-bg)',
                'brand-text': 'var(--color-text)',
                cta: 'var(--color-primary)',
            },
            boxShadow: {
                'ambient-sm': '0 4px 12px -2px rgba(26,28,28,0.04)',
                'ambient': '0 12px 32px -8px rgba(26,28,28,0.06)',
                'ambient-lg': '0 20px 48px -12px rgba(26,28,28,0.08)',
                'ambient-xl': '0 32px 64px -16px rgba(26,28,28,0.10)',
                'soft-sm': 'var(--shadow-card)',
                'soft-md': 'var(--shadow-card)',
                'soft-lg': 'var(--shadow-card-hover)',
                'soft-xl': 'var(--shadow-float)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
            },
        },
    },
    safelist: [
        'text-primary', 'text-blue-400', 'text-purple-400', 'text-orange-400',
        'text-green-400', 'text-red-400', 'text-amber-400', 'text-pink-400',
        'bg-primary', 'bg-red-500', 'bg-green-500', 'bg-amber-500',
        'bg-blue-600/20', 'bg-purple-600/20', 'bg-orange-600/20',
        'bg-pink-600/20', 'bg-green-600/20',
        'border-blue-500/30', 'border-purple-500/30', 'border-orange-500/30',
        'border-pink-500/30', 'border-green-500/30',
        'animate-in', 'slide-in-from-top-4',
    ],
    plugins: [],
}
