import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService, Order, OrderInput } from '../services/orderService';
import { productService, Product } from '../services/productService';
import { warehouseService, Warehouse } from '../services/warehouseService';
import { useToast } from '../contexts/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [outgoingOrders, setOutgoingOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orderType, setOrderType] = useState<'incoming' | 'outgoing'>('incoming');
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [formData, setFormData] = useState<OrderInput>({
    productId: '',
    warehouseId: '',
    quantity: 1,
    notes: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [incoming, outgoing, prodData, whData] = await Promise.all([
        orderService.getIncomingOrders(),
        orderService.getOutgoingOrders(),
        productService.getAll(),
        warehouseService.getAll(),
      ]);
      setIncomingOrders(incoming);
      setOutgoingOrders(outgoing);
      setProducts(prodData);
      setWarehouses(whData);
    } catch (error) {
      addToast(t('orders.noOrders'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const allOrders = [...incomingOrders.map(o => ({...o, type: 'Incoming'})), ...outgoingOrders.map(o => ({...o, type: 'Outgoing'}))];
    exportToCsv('orders', ['Type', 'Product', 'Warehouse', 'Quantity', 'Notes', 'Date'], allOrders.map((o: any) => [
      o.type, o.product?.name || 'N/A', o.warehouse?.name || 'N/A', String(o.quantity), o.notes || '', new Date(o.createdAt).toLocaleDateString(),
    ]));
    addToast('CSV exported ✓');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (orderType === 'incoming') {
        await orderService.createIncomingOrder(formData);
      } else {
        await orderService.createOutgoingOrder(formData);
      }
      addToast((orderType === 'incoming' ? t('orders.createIncoming') : t('orders.createOutgoing')) + ' ✓');
      resetForm();
      loadData();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error creating order', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ productId: '', warehouseId: '', quantity: 1, notes: '' });
    setShowForm(false);
  };

  const openForm = (type: 'incoming' | 'outgoing') => {
    setOrderType(type);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const currentOrders = activeTab === 'incoming' ? incomingOrders : outgoingOrders;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>{t('orders.title')}</h1>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={handleExportCsv}>📥 CSV</button>
          <button className="btn-success" onClick={() => openForm('incoming')}>
            📥 {t('orders.createIncoming')}
          </button>
          <button className="btn-warning" onClick={() => openForm('outgoing')}>
            📤 {t('orders.createOutgoing')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>
            {orderType === 'incoming' ? '📥 ' + t('orders.createIncoming') : '📤 ' + t('orders.createOutgoing')}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('orders.product')} *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                >
                  <option value="">{t('orders.selectProduct')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('orders.warehouse')} *</label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  required
                >
                  <option value="">{t('orders.selectWarehouse')}</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('orders.quantity')} *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>{t('orders.notes')}</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                + {t('orders.createOrder')}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>
                {t('orders.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          📥 {t('orders.incoming')} ({incomingOrders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          📤 {t('orders.outgoing')} ({outgoingOrders.length})
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>{t('orders.type')}</th>
              <th>{t('orders.product')}</th>
              <th>{t('orders.warehouse')}</th>
              <th>{t('orders.quantity')}</th>
              <th>{t('orders.notes')}</th>
              <th>{t('orders.date')}</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">{activeTab === 'incoming' ? '📥' : '📤'}</div>
                    <div className="empty-state-text">{t('orders.noOrders')}</div>
                    <div className="empty-state-sub">Create a new {activeTab} order to get started</div>
                  </div>
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className={`badge ${activeTab === 'incoming' ? 'badge-success' : 'badge-warning'}`}>
                      {activeTab === 'incoming' ? '📥 ' + t('orders.incoming') : '📤 ' + t('orders.outgoing')}
                    </span>
                  </td>
                  <td><strong>{order.product?.name || 'N/A'}</strong></td>
                  <td>{order.warehouse?.name || 'N/A'}</td>
                  <td><strong>{order.quantity}</strong></td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.notes || '—'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
