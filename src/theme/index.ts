import { useColorScheme } from 'react-native';
import { useStore } from '../store';

const palette = {
  // Dark mode base (Cinematic Dark)
  darkBg: '#09090B', // Zinc 950
  darkSurface1: '#18181B', // Zinc 900
  darkSurface2: '#27272A', // Zinc 800
  darkSurface3: '#3F3F46', // Zinc 700
  darkBorder: '#27272A',
  darkBorderSubtle: '#18181B',

  // Light mode base
  lightBg: '#F8FAFC', // Slate 50
  lightSurface1: '#FFFFFF',
  lightSurface2: '#F1F5F9', // Slate 100
  lightSurface3: '#E2E8F0', // Slate 200
  lightBorder: '#E2E8F0',
  lightBorderSubtle: '#F1F5F9',

  // Core Brand
  brandPrimary: '#3B82F6', // Blue
  brandPrimaryDark: '#60A5FA', 

  // Accents (Cinematic / Muted Premium)
  accentCareer: '#8B5CF6',   // Violet
  accentFitness: '#10B981',  // Emerald
  accentFinance: '#F59E0B',  // Amber
  accentTasks: '#0EA5E9',    // Sky
  accentDanger: '#EF4444',   // Red
  accentSuccess: '#22C55E',  // Green

  // Text
  textDarkPrimary: '#FAFAFA',
  textDarkSecondary: '#A1A1AA', // Zinc 400
  textDarkMuted: '#52525B',     // Zinc 600

  textLightPrimary: '#09090B',
  textLightSecondary: '#52525B', // Zinc 600
  textLightMuted: '#A1A1AA',     // Zinc 400
};

export const colors = {
  light: {
    background: palette.lightBg,
    surface1: palette.lightSurface1,
    surface2: palette.lightSurface2,
    surface3: palette.lightSurface3,
    border: palette.lightBorder,
    borderSubtle: palette.lightBorderSubtle,
    text: palette.textLightPrimary,
    textSecondary: palette.textLightSecondary,
    textMuted: palette.textLightMuted,
    primary: palette.brandPrimary,
    
    accentCareer: palette.accentCareer,
    accentFitness: palette.accentFitness,
    accentFinance: palette.accentFinance,
    accentTasks: palette.accentTasks,
    error: palette.accentDanger,
    success: palette.accentSuccess,
    
    overlay: 'rgba(0, 0, 0, 0.4)',
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: palette.darkBg,
    surface1: palette.darkSurface1,
    surface2: palette.darkSurface2,
    surface3: palette.darkSurface3,
    border: palette.darkBorder,
    borderSubtle: palette.darkBorderSubtle,
    text: palette.textDarkPrimary,
    textSecondary: palette.textDarkSecondary,
    textMuted: palette.textDarkMuted,
    primary: palette.brandPrimaryDark,

    accentCareer: palette.accentCareer,
    accentFitness: palette.accentFitness,
    accentFinance: palette.accentFinance,
    accentTasks: palette.accentTasks,
    error: palette.accentDanger,
    success: palette.accentSuccess,

    overlay: 'rgba(0, 0, 0, 0.6)',
    glassBackground: 'rgba(24, 24, 27, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.05)',
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  hero: { fontSize: 56, fontFamily: 'Outfit_700Bold', letterSpacing: -1.5 },
  display: { fontSize: 40, fontFamily: 'Outfit_700Bold', letterSpacing: -1 },
  h1: { fontSize: 32, fontFamily: 'Outfit_700Bold', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontFamily: 'Outfit_600SemiBold', letterSpacing: -0.3 },
  h3: { fontSize: 20, fontFamily: 'Outfit_600SemiBold' },
  bodyLarge: { fontSize: 18, fontFamily: 'Outfit_500Medium' },
  body: { fontSize: 16, fontFamily: 'Outfit_400Regular' },
  caption: { fontSize: 14, fontFamily: 'Outfit_500Medium' },
  micro: { fontSize: 12, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};

export const radius = {
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  round: 9999,
};

export const shadows = {
  light: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 5 },
  },
  dark: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 5 },
  },
};

export function useAppTheme() {
  const storeTheme = useStore(state => state.theme);
  const systemTheme = useColorScheme();
  
  const isDark = storeTheme === 'dark' || (storeTheme === 'system' && systemTheme === 'dark');
  const theme = isDark ? colors.dark : colors.light;
  
  return {
    isDark,
    theme,
    colors: theme,
    spacing,
    typography,
    radius,
    shadows: isDark ? shadows.dark : shadows.light,
  };
}
