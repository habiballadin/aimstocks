import React from 'react';
import { Card, Text, Badge, Button } from '@chakra-ui/react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { formatNotificationTime } from '../../utils/formatters';
import { useToast } from '../common/ToastProvider';

interface NotificationData {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: string;
}

interface NotificationListProps {
  notifications: NotificationData[];
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const { showToast } = useToast();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return CheckCircle;
      case 'WARNING': return AlertTriangle;
      case 'ERROR': return AlertTriangle;
      case 'INFO': return Info;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'success';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'danger';
      case 'INFO': return 'brand';
      default: return 'neutral';
    }
  };



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'neutral';
    }
  };

  const handleMarkAsRead = () => {
    showToast({
      type: 'success',
      title: 'Marked as Read',
      message: 'Notification has been marked as read.'
    });
  };

  const handleDelete = () => {
    showToast({
      type: 'info',
      title: 'Notification Deleted',
      message: 'Notification has been removed.'
    });
  };

  const handleMarkAllAsRead = () => {
    showToast({
      type: 'success',
      title: 'All Marked as Read',
      message: 'All notifications have been marked as read.'
    });
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Text className="font-semibold">
          {notifications.length} notifications ({unreadNotifications.length} unread)
        </Text>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle size={16} />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card.Root>
            <Card.Body className="text-center py-8">
              <Info size={48} className="mx-auto mb-4" color="#a0aec0" />
              <Text className="text-lg font-semibold mb-2">No Notifications</Text>
              <Text className="text-neutral-600">
                You're all caught up! New notifications will appear here.
              </Text>
            </Card.Body>
          </Card.Root>
        ) : (
          notifications.map((notification) => (
            <Card.Root 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-brand-500 bg-brand-50' : ''
              }`}
            >
              <Card.Body>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {React.createElement(getNotificationIcon(notification.type), { 
                      size: 20, 
                      color: getNotificationColor(notification.type) === 'success' ? '#38a169' : 
                             getNotificationColor(notification.type) === 'warning' ? '#d69e2e' : 
                             getNotificationColor(notification.type) === 'danger' ? '#e53e3e' : 
                             getNotificationColor(notification.type) === 'brand' ? '#3182ce' : '#718096'
                    })}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Text className="font-semibold">{notification.title}</Text>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                        )}
                        <Badge 
                          colorPalette={getPriorityColor(notification.priority)} 
                          variant="subtle" 
                          size="sm"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      
                      <Text className="text-sm text-neutral-700 mb-2">
                        {notification.message}
                      </Text>
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>{notification.category}</span>
                        <span>{formatNotificationTime(notification.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!notification.read && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleMarkAsRead}
                        title="Mark as read"
                      >
                        <CheckCircle size={16} />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      colorPalette="danger"
                      onClick={handleDelete}
                      title="Delete notification"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card.Root>
          ))
        )}
      </div>
    </div>
  );
};