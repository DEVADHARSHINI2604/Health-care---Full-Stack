import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiService } from '../../lib/api';
import { Notification } from '../../lib/types';
import { Bell, X, Calendar, AlertCircle, Info } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="size-5 text-blue-600" />;
      case 'reminder':
        return <Bell className="size-5 text-orange-600" />;
      default:
        return <Info className="size-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed top-16 right-4 w-96 z-50 animate-in slide-in-from-top-2">
      <Card className="shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Notifications
            </CardTitle>
            <CardDescription>{unreadCount} unread</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.read && (
                        <Badge variant="destructive" className="text-xs flex-shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
              <div className="p-8 text-center text-gray-500">No notifications</div>
            )}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <Button variant="outline" className="w-full" size="sm">
              Mark all as read
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
