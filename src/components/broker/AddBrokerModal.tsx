import React, { useState } from 'react';
import {
  Dialog,
  Text,
  Button,
  Input,
  Field,
  Select,
  Stack,
  Flex,
  Alert,
  Separator,
  createListCollection
} from '@chakra-ui/react';
import { BrokerType } from '../../types/enums';
import { formatBrokerName } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface BrokerCredentials {
  clientId: string;
  apiSecret: string;
  appId?: string;
  accessToken?: string;
}

interface AddBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (brokerType: BrokerType, credentials: BrokerCredentials) => Promise<void>;
  availableBrokers: Array<{
    type: BrokerType;
    name: string;
    supported: boolean;
  }>;
}

export const AddBrokerModal: React.FC<AddBrokerModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  availableBrokers
}) => {
  const [selectedBroker, setSelectedBroker] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<BrokerCredentials>({
    clientId: '',
    apiSecret: '',
    appId: '',
    accessToken: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setSelectedBroker([]);
    setCredentials({
      clientId: '',
      apiSecret: '',
      appId: '',
      accessToken: ''
    });
    setError(null);
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (selectedBroker.length === 0) {
      errors.broker = 'Please select a broker';
    }

    if (!credentials.clientId.trim()) {
      errors.clientId = 'Client ID is required';
    }

    if (!credentials.apiSecret.trim()) {
      errors.apiSecret = 'API Secret is required';
    }

    // Broker-specific validation
    if (selectedBroker[0] === BrokerType.FYERS && !credentials.appId?.trim()) {
      errors.appId = 'App ID is required for Fyers';
    }

    if (selectedBroker[0] === BrokerType.UPSTOX && !credentials.accessToken?.trim()) {
      errors.accessToken = 'Access Token is required for Upstox';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    setIsConnecting(true);
    setError(null);

    try {
      await onConnect(selectedBroker[0] as BrokerType, credentials);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to broker');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      resetForm();
      onClose();
    }
  };

  const getFieldsForBroker = (brokerType: BrokerType) => {
    const commonFields = ['clientId', 'apiSecret'];
    
    switch (brokerType) {
      case BrokerType.FYERS:
        return [...commonFields, 'appId'];
      case BrokerType.UPSTOX:
        return [...commonFields, 'accessToken'];
      case BrokerType.ZERODHA:
        return [...commonFields, 'accessToken'];
      default:
        return commonFields;
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'clientId':
        return 'Client ID';
      case 'apiSecret':
        return 'API Secret';
      case 'appId':
        return 'App ID';
      case 'accessToken':
        return 'Access Token';
      default:
        return field;
    }
  };

  const getFieldPlaceholder = (field: string, brokerType: BrokerType) => {
    switch (field) {
      case 'clientId':
        return `Enter your ${formatBrokerName(brokerType)} Client ID`;
      case 'apiSecret':
        return `Enter your ${formatBrokerName(brokerType)} API Secret`;
      case 'appId':
        return `Enter your ${formatBrokerName(brokerType)} App ID`;
      case 'accessToken':
        return `Enter your ${formatBrokerName(brokerType)} Access Token`;
      default:
        return `Enter ${field}`;
    }
  };

  const supportedBrokers = availableBrokers.filter(broker => broker.supported);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
        <Dialog.Header>
          <Flex justify="space-between" align="center" width="full">
            <Flex align="center" gap={2}>
              <AddCircleOutlinedIcon style={{ fontSize: 20, color: 'var(--chakra-colors-brand-500)' }} />
              <Text textStyle="heading.md">Add New Broker Connection</Text>
            </Flex>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isConnecting}>
              <CloseIcon style={{ fontSize: 16 }} />
            </Button>
          </Flex>
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap={4}>
            {error && (
              <ErrorMessage
                message={error}
                onRetry={() => setError(null)}
              />
            )}

            {/* Broker Selection */}
            <Field.Root invalid={!!validationErrors.broker}>
              <Field.Label>Select Broker</Field.Label>
              <Select.Root
                collection={createListCollection({ items: supportedBrokers.map(b => ({ value: b.type, label: b.name })) })}
                value={selectedBroker}
                onValueChange={(e) => {
                  setSelectedBroker(e.value);
                  setValidationErrors(prev => ({ ...prev, broker: '' }));
                }}
                disabled={isConnecting}
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Choose a broker..." />
                </Select.Trigger>
                <Select.Content>
                  {supportedBrokers.map((broker) => (
                    <Select.Item key={broker.type} item={broker.type}>
                      {broker.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {validationErrors.broker && (
                <Field.ErrorText>{validationErrors.broker}</Field.ErrorText>
              )}
            </Field.Root>

            {selectedBroker && (
              <>
                <Separator />

                <Alert.Root status="info" variant="subtle">
                  <Alert.Indicator />
                  <Alert.Description>
                    Enter your {formatBrokerName(selectedBroker[0] as BrokerType)} API credentials.
                    These will be securely stored and used to establish the connection.
                  </Alert.Description>
                </Alert.Root>

                {/* Dynamic Form Fields */}
                <Stack gap={3}>
                  {getFieldsForBroker(selectedBroker[0] as BrokerType).map((field) => (
                    <Field.Root key={field} invalid={!!validationErrors[field]}>
                      <Field.Label>{getFieldLabel(field)}</Field.Label>
                      <Input
                        type={field === 'apiSecret' ? 'password' : 'text'}
                        placeholder={getFieldPlaceholder(field, selectedBroker[0] as BrokerType)}
                        value={credentials[field as keyof BrokerCredentials] || ''}
                        onChange={(e) => {
                          setCredentials(prev => ({
                            ...prev,
                            [field]: e.target.value
                          }));
                          setValidationErrors(prev => ({ ...prev, [field]: '' }));
                        }}
                        disabled={isConnecting}
                      />
                      {validationErrors[field] && (
                        <Field.ErrorText>{validationErrors[field]}</Field.ErrorText>
                      )}
                    </Field.Root>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
          <Flex gap={3} width="full" justify="flex-end">
            <Button variant="outline" onClick={handleClose} disabled={isConnecting}>
              Cancel
            </Button>
            <Button
              colorPalette="brand"
              onClick={handleConnect}
              disabled={!selectedBroker || isConnecting}
              loading={isConnecting}
            >
              {isConnecting ? (
                <LoadingSpinner size="sm" message="" />
              ) : (
                'Connect Broker'
              )}
            </Button>
          </Flex>
        </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};