import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { Upload, Download, FileText } from 'lucide-react';

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, batchName: string) => void;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  open,
  onClose,
  onUpload
}) => {
  const [batchName, setBatchName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!batchName.trim()) {
      newErrors.batchName = 'Batch name is required';
    }
    if (!selectedFile) {
      newErrors.file = 'Please select a CSV file';
    } else if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      newErrors.file = 'Only CSV files are allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    } else {
      setErrors(prev => ({ ...prev, file: 'Only CSV files are allowed' }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (validateForm() && selectedFile) {
      setUploading(true);
      try {
        await onUpload(selectedFile, batchName);
        onClose();
        // Reset form
        setBatchName('');
        setSelectedFile(null);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `symbol,side,orderType,quantity,price,venue,timeInForce
RELIANCE,BUY,LIMIT,100,2850.00,NSE,DAY
TCS,SELL,MARKET,50,,NSE,IOC
INFY,BUY,LIMIT,75,1820.00,NSE,GTC`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_order_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Upload size={24} />
          Bulk Order Upload
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            Upload a CSV file containing multiple orders. Make sure to follow the required format.
          </Alert>

          <TextField
            label="Batch Name"
            value={batchName}
            onChange={(e) => {
              setBatchName(e.target.value);
              if (errors.batchName) setErrors(prev => ({ ...prev, batchName: '' }));
            }}
            error={!!errors.batchName}
            helperText={errors.batchName || 'Enter a descriptive name for this batch'}
            placeholder="e.g., Portfolio Rebalancing Q1 2025"
            fullWidth
          />

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Upload CSV File
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download size={16} />}
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
            </Stack>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : errors.file ? 'error.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: dragOver ? 'primary.50' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              
              {selectedFile ? (
                <Stack alignItems="center" spacing={2}>
                  <FileText size={48} color="#22c55e" />
                  <Typography variant="h6" fontWeight="bold">
                    {selectedFile.name}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Chip label={`${(selectedFile.size / 1024).toFixed(1)} KB`} size="small" />
                    <Chip label="CSV" size="small" color="success" />
                  </Stack>
                  <Typography variant="body2" color="textSecondary">
                    Click to select a different file
                  </Typography>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <Upload size={48} color={dragOver ? '#2563eb' : '#9ca3af'} />
                  <Typography variant="h6" fontWeight="bold">
                    Drop your CSV file here
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    or click to browse files
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Supported format: CSV files only
                  </Typography>
                </Stack>
              )}
            </Box>
            
            {errors.file && (
              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                {errors.file}
              </Typography>
            )}
          </Box>

          <Alert severity="warning">
            <Typography variant="body2" fontWeight="bold" mb={1}>
              CSV Format Requirements:
            </Typography>
            <Typography variant="body2" component="div">
              • Required columns: symbol, side, orderType, quantity, venue, timeInForce<br/>
              • Optional columns: price (required for LIMIT orders)<br/>
              • Side values: BUY, SELL<br/>
              • Order types: MARKET, LIMIT, STOP_LOSS<br/>
              • Venues: NSE, BSE, MCX
            </Typography>
          </Alert>

          {uploading && (
            <Box>
              <Typography variant="body2" mb={1}>
                Uploading and validating orders...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={uploading || !selectedFile || !batchName}
          startIcon={<Upload size={16} />}
        >
          {uploading ? 'Uploading...' : 'Upload Batch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};