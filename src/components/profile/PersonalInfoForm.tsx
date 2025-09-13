import React, { useState } from 'react';
import { Card, Grid, Field, Button, Text, Input, Textarea } from '@chakra-ui/react';
import { Save, Edit, User } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfo;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setIsEditing(false);
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information has been saved successfully.'
      });
    }
  };

  const handleCancel = () => {
    setFormData(data);
    setErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card.Root>
      <Card.Body>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User size={24} color="#3182ce" />
            <div>
              <Text className="text-lg font-semibold">Personal Information</Text>
              <Text className="text-sm text-neutral-600">
                Manage your personal details and contact information
              </Text>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button colorPalette="brand" onClick={handleSave}>
                  <Save size={16} />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit size={16} />
                Edit
              </Button>
            )}
          </div>
        </div>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Field.Root invalid={!!errors.firstName} required>
            <Field.Label>First Name</Field.Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? 'bg-neutral-50' : ''}
            />
            {errors.firstName && (
              <Field.ErrorText>{errors.firstName}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.lastName} required>
            <Field.Label>Last Name</Field.Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? 'bg-neutral-50' : ''}
            />
            {errors.lastName && (
              <Field.ErrorText>{errors.lastName}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.email} required>
            <Field.Label>Email Address</Field.Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? 'bg-neutral-50' : ''}
            />
            {errors.email && (
              <Field.ErrorText>{errors.email}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.phone} required>
            <Field.Label>Phone Number</Field.Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? 'bg-neutral-50' : ''}
            />
            {errors.phone && (
              <Field.ErrorText>{errors.phone}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.dateOfBirth} required>
            <Field.Label>Date of Birth</Field.Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? 'bg-neutral-50' : ''}
            />
            {errors.dateOfBirth && (
              <Field.ErrorText>{errors.dateOfBirth}</Field.ErrorText>
            )}
          </Field.Root>

          <div className="md:col-span-2">
            <Field.Root>
              <Field.Label>Address</Field.Label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-neutral-50' : ''}
                rows={3}
              />
            </Field.Root>
          </div>
        </Grid>

        {/* Account Status */}
        <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
          <Text className="text-sm font-medium mb-2">Account Status</Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-neutral-600">Account Type</div>
              <div className="font-semibold">Individual</div>
            </div>
            <div>
              <div className="text-neutral-600">Verification Status</div>
              <div className="font-semibold text-success-600">Verified</div>
            </div>
            <div>
              <div className="text-neutral-600">KYC Status</div>
              <div className="font-semibold text-success-600">Completed</div>
            </div>
            <div>
              <div className="text-neutral-600">Member Since</div>
              <div className="font-semibold">Jan 2023</div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};