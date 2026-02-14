import React, { useEffect, useState } from 'react';
import { warehouseService, Warehouse, WarehouseInput } from '../services/warehouseService';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

const Warehouses: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedWarehouse, setExpandedWarehouse] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<WarehouseInput>({
    name: '',
    location: '',
    description: '',
  });
  const [newProductData, setNewProductData] = useState({
    name: '',
    category: '',
    sku: '',
    price: 0,
    description: '',
    quantity: 0,
    minimumStock: 10,
  });

  const loadWarehouses = async () => {
    try {
      const data = await warehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      addToast(t('warehouses.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await warehouseService.update(editingId, formData);
        addToast(t('warehouses.updated') + ' ✓');
      } else {
        await warehouseService.create(formData);
        addToast(t('warehouses.created') + ' ✓');
      }
      resetForm();
      loadWarehouses();
    } catch (error: any) {
      addToast(error.response?.data?.message || t('warehouses.error'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('warehouses.deleteConfirm'))) return;
    try {
      await warehouseService.delete(id);
      addToast(t('warehouses.deleted') + ' ✓');
      loadWarehouses();
    } catch (error: any) {
      addToast(error.response?.data?.message || t('warehouses.error'), 'error');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      description: warehouse.description || '',
    });
    setEditingId(warehouse.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleProducts = (warehouseId: string) => {
    setExpandedWarehouse(expandedWarehouse === warehouseId ? null : warehouseId);
    setShowAddProduct(null);
  };

  const handleAddProductToWarehouse = (warehouseId: string) => {
    setShowAddProduct(warehouseId);
    setNewProductData({
      name: '', category: '', sku: '', price: 0, description: '',
      quantity: 0, minimumStock: 10,
    });
  };

  const handleSubmitProductToWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    const warehouseId = showAddProduct;
    if (!warehouseId) return;
    try {
      const product = await productService.create({
        name: newProductData.name,
        category: newProductData.category,
        sku: newProductData.sku,
        price: newProductData.price,
        description: newProductData.description,
      });
      await inventoryService.create({
        productId: product.id,
        warehouseId,
        quantity: newProductData.quantity,
        minimumStock: newProductData.minimumStock,
      });
      addToast('Product created & added to warehouse ✓');
      setShowAddProduct(null);
      loadWarehouses();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error adding product', 'error');
    }
  };

  const handleDeleteProductFromWarehouse = async (inventoryId: string) => {
    if (!window.confirm(t('warehouses.deleteConfirm'))) return;
    try {
      await inventoryService.delete(inventoryId);
      addToast('Product removed from warehouse ✓');
      loadWarehouses();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error removing product', 'error');
    }
  };

  const handleExportCsv = () => {
    exportToCsv('warehouses', ['Name', 'Location', 'Description', 'Products Count'], warehouses.map(w => [
      w.name, w.location, w.description || '', String(w.products?.length || 0),
    ]));
    addToast('CSV exported ✓');
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.location.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1>{t('warehouses.title')}</h1>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={handleExportCsv}>📥 CSV</button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ ' + t('warehouses.cancel') : '+ ' + t('warehouses.addWarehouse')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? '✏️ ' + t('warehouses.editWarehouse') : '🏭 ' + t('warehouses.newWarehouse')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('warehouses.name')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Main Warehouse"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('warehouses.location')} *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. New York, NY"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>{t('warehouses.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingId ? '💾 ' + t('warehouses.update') : '+ ' + t('warehouses.create')}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>
                {t('warehouses.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className="badge badge-neutral">{filteredWarehouses.length} {t('warehouses.title')}</span>
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
              <th>{t('warehouses.name')}</th>
              <th>{t('warehouses.location')}</th>
              <th>{t('warehouses.description')}</th>
              <th>{t('warehouses.products')}</th>
              <th>{t('warehouses.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredWarehouses.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🏭</div>
                    <div className="empty-state-text">{t('warehouses.noWarehouses')}</div>
                    <div className="empty-state-sub">Add your first warehouse to get started</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredWarehouses.map((warehouse) => (
                <React.Fragment key={warehouse.id}>
                  <tr>
                    <td><strong>{warehouse.name}</strong></td>
                    <td><span className="badge badge-info">📍 {warehouse.location}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{warehouse.description || '—'}</td>
                    <td>
                      <button
                        className={expandedWarehouse === warehouse.id ? 'btn-outline btn-sm' : 'btn-primary btn-sm'}
                        onClick={() => toggleProducts(warehouse.id)}
                      >
                        {expandedWarehouse === warehouse.id
                          ? '▲ ' + t('warehouses.hideProducts')
                          : `▼ ${t('warehouses.showProducts')} (${warehouse.products?.length || 0})`}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-warning btn-sm" onClick={() => handleEdit(warehouse)}>
                          ✏️ {t('warehouses.edit')}
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => handleDelete(warehouse.id)}>
                          🗑 {t('warehouses.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedWarehouse === warehouse.id && (
                    <tr className="expanded-row">
                      <td colSpan={5}>
                        <div style={{ marginBottom: '16px' }}>
                          <button
                            className="btn-success btn-sm"
                            onClick={() => handleAddProductToWarehouse(warehouse.id)}
                          >
                            + Add Product to Warehouse
                          </button>
                        </div>

                        {showAddProduct === warehouse.id && (
                          <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius)', marginBottom: '16px', border: '2px dashed var(--border)' }}>
                            <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>➕ {t('warehouses.addNewProduct')}</h4>
                            <form onSubmit={handleSubmitProductToWarehouse}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('products.name')} *</label>
                                  <input type="text" value={newProductData.name} onChange={(e) => setNewProductData({...newProductData, name: e.target.value})} placeholder="Product name" required />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('products.category')} *</label>
                                  <input type="text" value={newProductData.category} onChange={(e) => setNewProductData({...newProductData, category: e.target.value})} placeholder="e.g. Electronics" required />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('products.sku')} *</label>
                                  <input type="text" value={newProductData.sku} onChange={(e) => setNewProductData({...newProductData, sku: e.target.value})} placeholder="e.g. SKU-001" required />
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('products.price')} *</label>
                                  <input type="number" step="0.01" value={newProductData.price} onChange={(e) => setNewProductData({...newProductData, price: parseFloat(e.target.value)})} required min="0" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('inventory.quantity')} *</label>
                                  <input type="number" value={newProductData.quantity} onChange={(e) => setNewProductData({...newProductData, quantity: parseInt(e.target.value)})} required min="0" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('inventory.minimumStock')}</label>
                                  <input type="number" value={newProductData.minimumStock} onChange={(e) => setNewProductData({...newProductData, minimumStock: parseInt(e.target.value)})} min="0" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('products.description')}</label>
                                  <input type="text" value={newProductData.description} onChange={(e) => setNewProductData({...newProductData, description: e.target.value})} placeholder="Optional" />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="btn-success btn-sm">✓ {t('warehouses.create')}</button>
                                <button type="button" className="btn-outline btn-sm" onClick={() => setShowAddProduct(null)}>{t('warehouses.cancel')}</button>
                              </div>
                            </form>
                          </div>
                        )}

                        {warehouse.products && warehouse.products.length > 0 ? (
                          <div>
                            <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>📦 {t('warehouses.products')}</h4>
                            <table className="sub-table">
                              <thead>
                                <tr>
                                  <th>{t('products.name')}</th>
                                  <th>{t('products.category')}</th>
                                  <th>{t('warehouses.sku')}</th>
                                  <th>{t('warehouses.quantity')}</th>
                                  <th>{t('warehouses.price')}</th>
                                  <th>{t('warehouses.actions')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {warehouse.products.map((product) => (
                                  <tr key={product.id}>
                                    <td><strong>{product.name}</strong></td>
                                    <td><span className="badge badge-info">{product.category}</span></td>
                                    <td><code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>{product.sku}</code></td>
                                    <td><strong>{product.quantity}</strong></td>
                                    <td><strong>${product.price.toFixed(2)}</strong></td>
                                    <td>
                                      <button className="btn-danger btn-sm" onClick={() => handleDeleteProductFromWarehouse((product as any).inventoryId || product.id)}>
                                        🗑
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="empty-state" style={{ padding: '20px 0' }}>
                            <div className="empty-state-text">{t('warehouses.noProducts')}</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Warehouses;
