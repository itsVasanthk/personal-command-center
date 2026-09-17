export const colors = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    primary: '#007AFF',
    secondary: '#8E8E93',
    card: '#F2F2F7',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#0A84FF',
    secondary: '#8E8E93',
    card: '#1C1C1E',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 12, fontWeight: 'normal' as const },
};

export const borderRadius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};
