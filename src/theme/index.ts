import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    accent: '#CCCCCC',
  },
  dark: false,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFFFFF',
    background: '#000000',
    surface: '#111111',
    accent: '#333333',
  },
  dark: true,
};
