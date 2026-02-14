import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { inventoryService, Inventory, InventoryInput } from '../services/inventoryService';
import { productService, Product } from '../services/productService';
import { warehouseService, Warehouse } from '../services/warehouseService';
import { useToast } from '../contexts/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [lowStock, setLowStock] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<InventoryInput>({
    productId: '',
    warehouseId: '',
    quantity: 0,
    minimumStock: 10,
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [invData, lowStockData, prodData, whData] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getLowStock(),
        productService.getAll(),
        warehouseService.getAll(),
      ]);
      setInventory(invData);
      setLowStock(lowStockData);
      setProducts(prodData);
      setWarehouses(whData);
    } catch (error) {
      addToast(t('inventory.noInventory'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('inventory', ['Product', 'Warehouse', 'Quantity', 'Min Stock', 'Status'], inventory.map(inv => [
      inv.product?.name || 'N/A', inv.warehouse?.name || 'N/A', String(inv.quantity), String(inv.minimumStock), inv.quantity <= inv.minimumStock ? 'Low' : 'OK',
    ]));
    addToast('CSV exported ✓');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.update(editingId, formData);
        addToast(t('inventory.update') + ' ✓');
      } else {
        await inventoryService.create(formData);
        addToast(t('inventory.create') + ' ✓');
      }
      resetForm();
      loadData();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error saving inventory', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('warehouses.deleteConfirm'))) return;
    try {
      await inventoryService.delete(id);
      addToast(t('inventory.delete') + ' ✓');
      loadData();
    } catch (error) {
      addToast('Error deleting inventory', 'error');
    }
  };

  const handleEdit = (inv: Inventory) => {
    setFormData({
      productId: inv.productId,
      warehouseId: inv.warehouseId,
      quantity: inv.quantity,
      minimumStock: inv.minimumStock,
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ productId: '', warehouseId: '', quantity: 0, minimumStock: 10 });
    setEditingId(null);
    setShowForm(false);
  };

  const displayData = showLowStock ? lowStock : inventory;
  const filteredData = displayData.filter(
    (inv) =>
      (inv.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.warehouse?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1>{t('inventory.title')}</h1>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={handleExportCsv}>📥 CSV</button>
          <button
            className={showLowStock ? 'btn-outline' : 'btn-warning'}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            {showLowStock ? '📋 ' + t('inventory.showAll') : '⚠️ ' + t('inventory.showLowStock')}
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ ' + t('inventory.cancel') : '+ ' + t('inventory.addInventory')}
          </button>
        </div>
      </div>

      {lowStock.length > 0 && !showLowStock && (
        <div className="alert alert-warning">
          ⚠️ {lowStock.length} {t('inventory.lowStockAlert')}
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? '✏️ ' + t('inventory.editInventory') : '📦 ' + t('inventory.newInventory')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('inventory.product')} *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                  disabled={!!editingId}
                >
                  <option value="">{t('inventory.selectProduct')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('inventory.warehouse')} *</label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  required
                  disabled={!!editingId}
                >
                  <option value="">{t('inventory.selectWarehouse')}</option>
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
                <label>{t('inventory.quantity')} *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>{t('inventory.minimumStock')} *</label>
                <input
                  type="number"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) })}
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingId ? '💾 ' + t('inventory.update') : '+ ' + t('inventory.create')}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>
                {t('inventory.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-neutral">{filteredData.length} records</span>
            {showLowStock && <span className="badge badge-warning">⚠️ {t('inventory.showLowStock')}</span>}
          </div>
          <input
            type="text"
            placeholder={'🔍 ' + t('common.search') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '250px', padding: '8px 14px', fontSize: '0.85rem' }}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>{t('inventory.product')}</th>
              <th>{t('inventory.warehouse')}</th>
              <th>{t('inventory.quantity')}</th>
              <th>{t('inventory.minimumStock')}</th>
              <th>{t('inventory.status')}</th>
              <th>{t('inventory.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <div className="empty-state-text">{t('inventory.noInventory')}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((inv) => (
                <tr key={inv.id}>
                  <td><strong>{inv.product?.name || 'N/A'}</strong></td>
                  <td>{inv.warehouse?.name || 'N/A'}</td>
                  <td>
                    <strong style={{ color: inv.quantity <= inv.minimumStock ? 'var(--warning)' : 'var(--text)' }}>
                      {inv.quantity}
                    </strong>
                  </td>
                  <td>{inv.minimumStock}</td>
                  <td>
                    {inv.quantity <= inv.minimumStock ? (
                      <span className="badge badge-warning">⚠️ {t('inventory.statusLow')}</span>
                    ) : (
                      <span className="badge badge-success">✓ {t('inventory.statusOk')}</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-warning btn-sm" onClick={() => handleEdit(inv)}>
                        ✏️ {t('inventory.edit')}
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(inv.id)}>
                        🗑 {t('inventory.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
