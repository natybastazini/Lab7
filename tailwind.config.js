/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        noc: {
          bg: '#020617',
          card: '#0f172a',
          accent: '#3b82f6',
        },
        // Os tons 500 e 600 do slate original (#64748b e #475569) rendem
        // contraste de 3,7:1 sobre o fundo dos cartões. O mínimo da WCAG AA
        // para texto pequeno é 4,5:1. Estes valores mantêm o visual apagado
        // do painel e passam com folga (6,4:1 e 5,3:1), sem precisar trocar
        // as classes espalhadas pelos componentes.
        slate: {
          500: '#8b9cb3',
          600: '#7b8ea6',
        },
      },
    },
  },
  plugins: [],
}
