import React from 'react';
import { EmptyState as ChakraEmptyState, Button } from '@chakra-ui/react';
import { Plus, Search, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'add' | 'chart' | React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'search'
}) => {
  const getIcon = () => {
    if (React.isValidElement(icon)) return icon;
    
    switch (icon) {
      case 'add': return <Plus size={32} />;
      case 'chart': return <TrendingUp size={32} />;
      case 'search': 
      default: return <Search size={32} />;
    }
  };

  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content>
        <ChakraEmptyState.Indicator>
          <div style={{ color: '#a0aec0' }}>
            {getIcon()}
          </div>
        </ChakraEmptyState.Indicator>
        <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
        <ChakraEmptyState.Description>
          {description}
        </ChakraEmptyState.Description>
        {actionLabel && onAction && (
          <Button colorPalette="brand" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
};