/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        /* Blueprint palette — direct hex tokens */
        bp: {
          black: '#111418',
          'dark-gray': { 1: '#1C2127', 2: '#252A31', 3: '#2F343C', 4: '#383E47', 5: '#404854' },
          gray: { 1: '#5F6B7C', 2: '#738091', 3: '#8F99A8', 4: '#ABB3BF', 5: '#C5CBD3' },
          'light-gray': { 1: '#D3D8DE', 2: '#DCE0E5', 3: '#E5E8EB', 4: '#EDEFF2', 5: '#F6F7F9' },
          white: '#FFFFFF',
          blue: { 1: '#184A90', 2: '#215DB0', 3: '#2D72D2', 4: '#4C90F0', 5: '#8ABBFF' },
          green: { 1: '#165A36', 2: '#1C6E42', 3: '#238551', 4: '#32A467', 5: '#72CA9B' },
          orange: { 1: '#77450D', 2: '#935610', 3: '#C87619', 4: '#EC9A3C', 5: '#FBB360' },
          red: { 1: '#8E292C', 2: '#AC2F33', 3: '#CD4246', 4: '#E76A6E', 5: '#FA999C' },
          cerulean: { 1: '#0C5174', 2: '#0F6894', 3: '#147EB3', 4: '#3FA6DA', 5: '#68C1EE' },
          forest: { 1: '#1D7324', 2: '#238C2C', 3: '#29A634', 4: '#43BF4D', 5: '#62D96B' },
          gold: { 1: '#5C4405', 2: '#866103', 3: '#D1980B', 4: '#F0B726', 5: '#FBD065' },
          indigo: { 1: '#5642A6', 2: '#634DBF', 3: '#7961DB', 4: '#9881F3', 5: '#BDADFF' },
          lime: { 1: '#43501B', 2: '#5A701A', 3: '#8EB125', 4: '#B6D94C', 5: '#D4F17E' },
          rose: { 1: '#A82255', 2: '#C22762', 3: '#DB2C6F', 4: '#F5498B', 5: '#FF66A1' },
          sepia: { 1: '#5E4123', 2: '#7A542E', 3: '#946638', 4: '#AF855A', 5: '#D0B090' },
          turquoise: { 1: '#004D46', 2: '#007067', 3: '#00A396', 4: '#13C9BA', 5: '#7AE1D8' },
          vermilion: { 1: '#96290D', 2: '#B83211', 3: '#D33D17', 4: '#EB6847', 5: '#FF9980' },
          violet: { 1: '#5C255C', 2: '#7C327C', 3: '#9D3F9D', 4: '#BD6BBD', 5: '#D69FD6' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
