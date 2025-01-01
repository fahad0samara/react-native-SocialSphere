export const lightColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  notification: '#FF3B30',
};

export const darkColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  notification: '#FF453A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
  },
};

export const getThemeColors = (isDark: boolean) => 
  isDark ? darkColors : lightColors;
