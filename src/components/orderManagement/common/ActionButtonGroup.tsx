import React from 'react';
import { Stack, IconButton, Tooltip } from '@mui/material';
import { Play, Pause, Square, Settings, MoreHorizontal } from 'lucide-react';

interface ActionButtonGroupProps {
  type: 'algorithm' | 'order';
  status?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onSettings?: () => void;
  onMore?: () => void;
  disabled?: boolean;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  type,
  status,
  onStart,
  onPause,
  onStop,
  onSettings,
  onMore,
  disabled = false
}) => {
  if (type === 'algorithm') {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        {status === 'RUNNING' ? (
          <Tooltip title="Pause Algorithm">
            <IconButton 
              color="warning" 
              onClick={onPause}
              disabled={disabled}
              size="small"
            >
              <Pause size={20} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Start Algorithm">
            <IconButton 
              color="success" 
              onClick={onStart}
              disabled={disabled}
              size="small"
            >
              <Play size={20} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Stop Algorithm">
          <IconButton 
            color="error" 
            onClick={onStop}
            disabled={disabled}
            size="small"
          >
            <Square size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton 
            onClick={onSettings}
            disabled={disabled}
            size="small"
          >
            <Settings size={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  // Order action buttons
  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Settings">
        <IconButton size="small" color="primary" onClick={onSettings}>
          <Settings size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancel Order">
        <IconButton size="small" color="error" onClick={onStop}>
          <Square size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip title="More Actions">
        <IconButton size="small" onClick={onMore}>
          <MoreHorizontal size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};