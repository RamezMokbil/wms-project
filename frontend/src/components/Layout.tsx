import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
        <div className="container fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
