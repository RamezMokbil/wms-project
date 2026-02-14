import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/productService';
import { warehouseService, Warehouse } from '../services/warehouseService';
import { inventoryService } from '../services/inventoryService';
import { orderService } from '../services/orderService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    lowStockItems: 0,
    totalIncoming: 0,
    totalOutgoing: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [warehouseChartData, setWarehouseChartData] = useState<any[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      const [products, warehouses, lowStock, incomingOrders, outgoingOrders] = await Promise.all([
        productService.getAll(),
        warehouseService.getAll(),
        inventoryService.getLowStock(),
        orderService.getIncomingOrders(),
        orderService.getOutgoingOrders(),
      ]);

      setStats({
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        lowStockItems: lowStock.length,
        totalIncoming: incomingOrders.length,
        totalOutgoing: outgoingOrders.length,
      });

      // Warehouse bar chart data
      const whData = (warehouses as Warehouse[]).map((w) => ({
        name: w.name.length > 12 ? w.name.slice(0, 12) + '…' : w.name,
        products: w.products?.length || 0,
      }));
      setWarehouseChartData(whData);

      // Category pie chart data
      const catMap: Record<string, number> = {};
      products.forEach((p: any) => {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      });
      setCategoryChartData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      const allOrders = [
        ...incomingOrders.map((o: any) => ({ ...o, type: 'incoming' })),
        ...outgoingOrders.map((o: any) => ({ ...o, type: 'outgoing' })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      setRecentOrders(allOrders);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
      <div className="welcome-card">
        <h2>👋 {t('dashboard.welcome')}</h2>
        <p>
          {t('dashboard.title')} — {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <h3>{t('dashboard.totalProducts')}</h3>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">{t('products.title')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <h3>{t('dashboard.totalWarehouses')}</h3>
          <div className="stat-value">{stats.totalWarehouses}</div>
          <div className="stat-label">{t('warehouses.title')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <h3>{t('dashboard.totalInventory')}</h3>
          <div className="stat-value" style={{ color: stats.lowStockItems > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {stats.lowStockItems}
          </div>
          <div className="stat-label">
            {stats.lowStockItems > 0 ? '⚠️ Needs attention' : '✅ All good'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <h3>{t('orders.title')}</h3>
          <div className="stat-value">{stats.totalIncoming + stats.totalOutgoing}</div>
          <div className="stat-label">
            ↓ {stats.totalIncoming} {t('orders.incoming')} &nbsp;|&nbsp; ↑ {stats.totalOutgoing} {t('orders.outgoing')}
          </div>
        </div>
      </div>

      {(warehouseChartData.length > 0 || categoryChartData.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {warehouseChartData.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>📊 {t('dashboard.productsPerWarehouse')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={warehouseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Bar dataKey="products" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {categoryChartData.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>🥧 {t('dashboard.productsByCategory')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {categoryChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {recentOrders.length > 0 && (
        <div className="card">
          <h2>📋 {t('dashboard.recentOrders')}</h2>
          <table>
            <thead>
              <tr>
                <th>{t('orders.status')}</th>
                <th>{t('orders.product')}</th>
                <th>{t('orders.warehouse')}</th>
                <th>{t('orders.quantity')}</th>
                <th>{t('orders.date')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className={`badge ${order.type === 'incoming' ? 'badge-success' : 'badge-info'}`}>
                      {order.type === 'incoming' ? '↓ In' : '↑ Out'}
                    </span>
                  </td>
                  <td>{order.product?.name || 'N/A'}</td>
                  <td>{order.warehouse?.name || order.warehouseId?.name || 'N/A'}</td>
                  <td><strong>{order.quantity}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
