import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Gjensidige-aktig fargepalett (ikke det offisielle designsystemet, se AGENTS.md).
const gjensidigeOransje: MantineColorsTuple = [
  '#fff2e8', '#ffe1cc', '#ffc199', '#ff9d61', '#ff7d35',
  '#f96a1c', '#e6590f', '#c94a09', '#a63c08', '#823009',
];

export const theme = createTheme({
  primaryColor: 'gjensidige',
  colors: { gjensidige: gjensidigeOransje },
  fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
  headings: { fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif', fontWeight: '700' },
  defaultRadius: 'md',
  white: '#ffffff',
  black: '#1a1a1a',
});
