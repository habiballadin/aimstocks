import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Define custom tokens
const tokens = {
  colors: {
    brand: {
      50: { value: '#eff6ff' },
      100: { value: '#dbeafe' },
      200: { value: '#bfdbfe' },
      300: { value: '#93c5fd' },
      400: { value: '#60a5fa' },
      500: { value: '#3b82f6' },
      600: { value: '#2563eb' },
      700: { value: '#1d4ed8' },
      800: { value: '#1e40af' },
      900: { value: '#1e3a8a' },
      950: { value: '#172554' }
    },
    ai: {
      50: { value: '#f0f9ff' },
      100: { value: '#e0f2fe' },
      200: { value: '#bae6fd' },
      300: { value: '#7dd3fc' },
      400: { value: '#38bdf8' },
      500: { value: '#0ea5e9' },
      600: { value: '#0284c7' },
      700: { value: '#0369a1' },
      800: { value: '#075985' },
      900: { value: '#0c4a6e' },
      950: { value: '#082f49' }
    },
    success: {
      50: { value: '#f0fdf4' },
      100: { value: '#dcfce7' },
      200: { value: '#bbf7d0' },
      300: { value: '#86efac' },
      400: { value: '#4ade80' },
      500: { value: '#22c55e' },
      600: { value: '#16a34a' },
      700: { value: '#15803d' },
      800: { value: '#166534' },
      900: { value: '#14532d' },
      950: { value: '#052e16' }
    },
    danger: {
      50: { value: '#fef2f2' },
      100: { value: '#fee2e2' },
      200: { value: '#fecaca' },
      300: { value: '#fca5a5' },
      400: { value: '#f87171' },
      500: { value: '#ef4444' },
      600: { value: '#dc2626' },
      700: { value: '#b91c1c' },
      800: { value: '#991b1b' },
      900: { value: '#7f1d1d' },
      950: { value: '#450a0a' }
    },
    warning: {
      50: { value: '#fffbeb' },
      100: { value: '#fef3c7' },
      200: { value: '#fde68a' },
      300: { value: '#fcd34d' },
      400: { value: '#fbbf24' },
      500: { value: '#f59e0b' },
      600: { value: '#d97706' },
      700: { value: '#b45309' },
      800: { value: '#92400e' },
      900: { value: '#78350f' },
      950: { value: '#451a03' }
    },
    neutral: {
      50: { value: '#f8fafc' },
      100: { value: '#f1f5f9' },
      200: { value: '#e2e8f0' },
      300: { value: '#cbd5e1' },
      400: { value: '#94a3b8' },
      500: { value: '#64748b' },
      600: { value: '#475569' },
      700: { value: '#334155' },
      800: { value: '#1e293b' },
      900: { value: '#0f172a' },
      950: { value: '#020617' }
    },
    options: {
      call: { value: '#10b981' }, // Green for call options
      put: { value: '#ef4444' },  // Red for put options
      itm: { value: '#059669' },  // In-the-money
      otm: { value: '#6b7280' },  // Out-of-the-money
      atm: { value: '#3b82f6' }   // At-the-money
    },
    analytics: {
      positive: { value: '#22c55e' },
      negative: { value: '#ef4444' },
      neutral: { value: '#6b7280' },
      high: { value: '#dc2626' },
      medium: { value: '#f59e0b' },
      low: { value: '#10b981' }
    },
    notification: {
      success: { value: '#10b981' },
      error: { value: '#ef4444' },
      warning: { value: '#f59e0b' },
      info: { value: '#3b82f6' }
    }
  },
  fonts: {
    heading: { value: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    body: { value: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }
  }
};

// Define text styles
const textStyles = {
  'heading.xs': {
    description: 'Extra small heading',
    value: {
      fontFamily: 'heading',
      fontWeight: '600',
      fontSize: '0.75rem',
      lineHeight: '1rem'
    }
  },
  'heading.sm': {
    description: 'Small heading',
    value: {
      fontFamily: 'heading',
      fontWeight: '600',
      fontSize: '0.875rem',
      lineHeight: '1.25rem'
    }
  },
  'heading.md': {
    description: 'Medium heading',
    value: {
      fontFamily: 'heading',
      fontWeight: '600',
      fontSize: '1rem',
      lineHeight: '1.5rem'
    }
  },
  'heading.lg': {
    description: 'Large heading',
    value: {
      fontFamily: 'heading',
      fontWeight: '600',
      fontSize: '1.125rem',
      lineHeight: '1.75rem'
    }
  },
  'heading.xl': {
    description: 'Extra large heading',
    value: {
      fontFamily: 'heading',
      fontWeight: '700',
      fontSize: '1.25rem',
      lineHeight: '1.75rem'
    }
  },
  'heading.2xl': {
    description: '2x large heading',
    value: {
      fontFamily: 'heading',
      fontWeight: '700',
      fontSize: '1.5rem',
      lineHeight: '2rem'
    }
  }
};

// Define layer styles
const layerStyles = {
  'card.selected': {
    description: 'Selected card style',
    value: {
      borderWidth: '2px',
      borderColor: 'brand.500',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  'card.ai': {
    description: 'AI-themed card style',
    value: {
      borderWidth: '1px',
      borderColor: 'ai.200',
      background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
    }
  },
  'card.options': {
    description: 'Options trading card style',
    value: {
      borderWidth: '1px',
      borderColor: 'options.call',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
    }
  },
  'card.analytics': {
    description: 'Analytics card style',
    value: {
      borderWidth: '1px',
      borderColor: 'analytics.neutral',
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(156, 163, 175, 0.05) 100%)'
    }
  },
  'toast.success': {
    description: 'Success toast style',
    value: {
      borderWidth: '1px',
      borderColor: 'notification.success',
      background: 'rgba(16, 185, 129, 0.1)'
    }
  },
  'toast.error': {
    description: 'Error toast style',
    value: {
      borderWidth: '1px',
      borderColor: 'notification.error',
      background: 'rgba(239, 68, 68, 0.1)'
    }
  },
  'toast.warning': {
    description: 'Warning toast style',
    value: {
      borderWidth: '1px',
      borderColor: 'notification.warning',
      background: 'rgba(245, 158, 11, 0.1)'
    }
  },
  'toast.info': {
    description: 'Info toast style',
    value: {
      borderWidth: '1px',
      borderColor: 'notification.info',
      background: 'rgba(59, 130, 246, 0.1)'
    }
  }
};

// Create the theme configuration
export const config = defineConfig({
  theme: {
    tokens,
    textStyles,
    layerStyles
  }
});

// Create and export the theme system
export const theme = createSystem(defaultConfig, config);

// Default export for backward compatibility
export default theme;