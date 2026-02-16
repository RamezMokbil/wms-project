import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService, Notification } from '../services/notificationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleDeleteNotification = async (id: string) => {
    await notificationService.deleteNotification(id);
    fetchNotifications();
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      order: '🚚',
      stock: '⚠️',
      product: '📦',
      warehouse: '🏭',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('notifications.justNow');
    if (mins < 60) return `${mins}${t('notifications.minsAgo')}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}${t('notifications.hoursAgo')}`;
    const days = Math.floor(hours / 24);
    return `${days}${t('notifications.daysAgo')}`;
  };

  const navItems = [
    { path: '/dashboard', icon: '📊', label: t('nav.dashboard') },
    { path: '/products', icon: '📦', label: t('nav.products') },
    { path: '/warehouses', icon: '🏭', label: t('nav.warehouses') },
    { path: '/inventory', icon: '📋', label: t('nav.inventory') },
    { path: '/orders', icon: '🚚', label: t('nav.orders') },
    { path: '/profile', icon: '👤', label: t('nav.profile') },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>📦 WMS</h1>
          <p>{t('app.title')}</p>
        </div>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <select
            className="lang-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            style={{ marginBottom: '8px' }}
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="blue">🌊 Blue</option>
            <option value="purple">💜 Purple</option>
          </select>
          <select
            className="lang-select"
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 {t('nav.logout')}
          </button>
        </div>
      </aside>
      <div className="main-content">
        <div className="main-header">
          <div className="header-spacer"></div>
          <div className="notification-area" ref={notifRef}>
            <button
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              title={t('notifications.title')}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <h3>{t('notifications.title')}</h3>
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                      {t('notifications.markAllRead')}
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <span>🔕</span>
                      <p>{t('notifications.noNotifications')}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                      >
                        <div className="notification-item-icon">
                          {getTypeIcon(notif.type)}
                        </div>
                        <div className="notification-item-content">
                          <div className="notification-item-title">{notif.title}</div>
                          <div className="notification-item-message">{notif.message}</div>
                          <div className="notification-item-time">{getTimeAgo(notif.createdAt)}</div>
                        </div>
                        <button
                          className="notification-item-delete"
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                          title={t('notifications.delete')}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="container fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
