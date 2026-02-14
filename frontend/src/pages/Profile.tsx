import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService, Admin } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (error) {
      addToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      addToast('Password changed successfully ✓');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error changing password', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👤 {t('profile.title')}</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'white', fontWeight: 700
          }}>
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{profile?.name}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{profile?.email}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('profile.name')}
              </label>
              <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{profile?.name}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('profile.email')}
              </label>
              <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{profile?.email}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('profile.role')}
              </label>
              <p style={{ margin: '4px 0 0' }}><span className="badge badge-info">Admin</span></p>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('profile.joined')}
              </label>
              <p style={{ margin: '4px 0 0', fontWeight: 500 }}>
                {profile && (profile as any).createdAt
                  ? new Date((profile as any).createdAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <button className="btn-primary" onClick={() => setShowPasswordForm(!showPasswordForm)}>
            🔒 {showPasswordForm ? t('common.close') : t('profile.changePassword')}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>{t('profile.currentPassword')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('profile.newPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>{t('profile.confirmPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-success" disabled={saving}>
                  {saving ? '...' : '💾 ' + t('common.save')}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowPasswordForm(false)}>
                  {t('common.close')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
