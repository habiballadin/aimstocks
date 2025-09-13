import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  IconButton, 
  Avatar, 
  Menu, 
  Select,

  createListCollection
} from '@chakra-ui/react';
import { 
  Settings, 
  Globe, 
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { SupportedLanguage } from '../../types/enums';
import { mockStore } from '../../data/stockTradingMockData';
import { NotificationCenter } from '../dashboard/NotificationCenter';

interface HeaderProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLanguageChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(SupportedLanguage.ENGLISH);

  const languageOptions = createListCollection({
    items: [
      { value: SupportedLanguage.ENGLISH, label: 'English' },
      { value: SupportedLanguage.HINDI, label: 'हिंदी' },
      { value: SupportedLanguage.TAMIL, label: 'தமிழ்' },
      { value: SupportedLanguage.TELUGU, label: 'తెలుగు' },
      { value: SupportedLanguage.KANNADA, label: 'ಕನ್ನಡ' },
      { value: SupportedLanguage.MALAYALAM, label: 'മലയാളം' },
      { value: SupportedLanguage.BENGALI, label: 'বাংলা' },
      { value: SupportedLanguage.GUJARATI, label: 'ગુજરાતી' },
      { value: SupportedLanguage.MARATHI, label: 'मराठी' },
      { value: SupportedLanguage.PUNJABI, label: 'ਪੰਜਾਬੀ' }
    ]
  });

  const handleLanguageChange = (language: string) => {
    const lang = language as SupportedLanguage;
    setSelectedLanguage(lang);
    onLanguageChange?.(lang);
  };

  return (
    <Box 
      bg="white" 
      borderBottom="1px solid" 
      borderColor="neutral.200"
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex="sticky"
      shadow="sm"
    >
      <Flex justify="space-between" align="center">
        {/* Logo and Brand */}
        <Flex align="center" gap={3}>
          <Box 
            w={10} 
            h={10} 
            bg="gradient.brand" 
            borderRadius="lg" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Text color="white" fontWeight="bold" fontSize="lg">AI</Text>
          </Box>
          <Box>
            <Text textStyle="heading.md" color="neutral.900">
              AI Stock Trader
            </Text>
            <Flex align="center" gap={2}>
              <Shield size={14} color="#38a169" />
              <Text fontSize="xs" color="success.600" fontWeight="medium">
                SEBI Registered
              </Text>
            </Flex>
          </Box>
        </Flex>

        {/* Spacer */}
        <Box />

        {/* Right Side Actions */}
        <Flex align="center" gap={3}>
          {/* Language Selector */}
          <Select.Root 
            collection={languageOptions}
            value={[selectedLanguage]} 
            onValueChange={(e) => handleLanguageChange(e.value[0])}
            size="sm"
          >
            <Select.Trigger minW="120px">
              <Globe size={16} color="#718096" />
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              {languageOptions.items.map((option) => (
                <Select.Item key={option.value} item={option}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          {/* Notifications */}
          <NotificationCenter />

          {/* Settings */}
          <IconButton variant="ghost" size="sm">
            <Settings size={20} color="#718096" />
          </IconButton>

          {/* User Menu */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm" p={1}>
                <Avatar.Root size="sm">
                  <Avatar.Image src="https://i.pravatar.cc/150?img=1" />
                  <Avatar.Fallback>
                    <User size={16} />
                  </Avatar.Fallback>
                </Avatar.Root>
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item value="profile">
                <User size={16} />
                Profile
              </Menu.Item>
              <Menu.Item value="settings">
                <Settings size={16} />
                Settings
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item value="logout" color="danger.600">
                <LogOut size={16} />
                Logout
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Flex>
      </Flex>
    </Box>
  );
};