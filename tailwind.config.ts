import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		animation: {
  			'coin-earned': 'coin-earned 0.6s ease-in-out',
  		},
  		keyframes: {
  			'coin-earned': {
  				'0%, 100%': {
  					transform: 'scale(1)',
  					filter: 'brightness(1) drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
  				},
  				'15%': {
  					transform: 'scale(3)',
  					filter: 'brightness(1.5) drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
  				},
  				'30%': {
  					transform: 'scale(1)',
  					filter: 'brightness(1) drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
  				},
  				'45%': {
  					transform: 'scale(2.8)',
  					filter: 'brightness(1.5) drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
  				},
  				'60%': {
  					transform: 'scale(1)',
  					filter: 'brightness(1) drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
  				},
  				'75%': {
  					transform: 'scale(2.6)',
  					filter: 'brightness(1.5) drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
  				},
  				'90%': {
  					transform: 'scale(1)',
  					filter: 'brightness(1) drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
  				},
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			honey: {
  				50: '#fffbeb',
  				100: '#fef3c7',
  				200: '#fde68a',
  				300: '#fcd34d',
  				400: '#fbbf24',
  				500: '#f59e0b',
  				600: '#d97706',
  				700: '#b45309',
  				800: '#92400e',
  				900: '#78350f',
  			},
  			bee: {
  				dark: '#1a1a1a',
  				stripe: '#fbbf24',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
