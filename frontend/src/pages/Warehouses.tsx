import React, { useEffect, useState } from 'react';
import { warehouseService, Warehouse, WarehouseInput } from '../services/warehouseService';
import { productService, Product } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

const Warehouses: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
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
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addProductData, setAddProductData] = useState({
    quantity: 0,
    minimumStock: 10,
  });
  const [productFilter, setProductFilter] = useState<string>('');

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

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setAllProducts(data);
    } catch (error) {
      // silent
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadProducts();
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
    setSelectedProductId('');
    setAddProductData({ quantity: 0, minimumStock: 10 });
    setProductFilter('');
  };

  const handleSubmitProductToWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    const warehouseId = showAddProduct;
    if (!warehouseId || !selectedProductId) return;
    try {
      await inventoryService.create({
        productId: selectedProductId,
        warehouseId,
        quantity: addProductData.quantity,
        minimumStock: addProductData.minimumStock,
      });
      addToast('Product added to warehouse ✓');
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

  // Get products already in a warehouse
  const getWarehouseProductIds = (warehouse: Warehouse): string[] => {
    return (warehouse.products || []).map((p: any) => p.productId || p.id);
  };

  // Filter available products (not already in the warehouse)
  const getAvailableProducts = (warehouse: Warehouse): Product[] => {
    const existingIds = getWarehouseProductIds(warehouse);
    let available = allProducts.filter(p => !existingIds.includes(p.id));
    if (productFilter) {
      available = available.filter(p => p.category === productFilter);
    }
    return available;
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
                            + {t('warehouses.addExistingProduct')}
                          </button>
                        </div>

                        {showAddProduct === warehouse.id && (
                          <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '16px', border: '2px dashed var(--border)' }}>
                            <h4 style={{ marginBottom: '14px', color: 'var(--text)' }}>📦 {t('warehouses.selectExistingProduct')}</h4>

                            {/* Category filter pills */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                              <button type="button" className={`btn-sm ${!productFilter ? 'btn-primary' : 'btn-outline'}`} onClick={() => setProductFilter('')}>
                                All
                              </button>
                              <button type="button" className={`btn-sm ${productFilter === 'Paints' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setProductFilter('Paints')} style={productFilter === 'Paints' ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}>
                                🎨 {t('categories.Paints')}
                              </button>
                              <button type="button" className={`btn-sm ${productFilter === 'Iron' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setProductFilter('Iron')} style={productFilter === 'Iron' ? { background: '#64748b', borderColor: '#64748b' } : {}}>
                                🚪 {t('categories.Iron')}
                              </button>
                            </div>

                            <form onSubmit={handleSubmitProductToWarehouse}>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('inventory.product')} *</label>
                                  <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                                  >
                                    <option value="">{t('inventory.selectProduct')}</option>
                                    {getAvailableProducts(warehouse).map((product) => (
                                      <option key={product.id} value={product.id}>
                                        {product.category === 'Paints' ? '🎨' : '🚪'} {product.name} (${product.price.toFixed(2)}, {product.unitsPerProduct || 1} units)
                                      </option>
                                    ))}
                                  </select>
                                  {getAvailableProducts(warehouse).length === 0 && (
                                    <small style={{ color: 'var(--warning)', marginTop: '4px', display: 'block' }}>
                                      No available products. Create products on the Products page first.
                                    </small>
                                  )}
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('inventory.quantity')} *</label>
                                  <input type="number" value={addProductData.quantity} onChange={(e) => setAddProductData({...addProductData, quantity: parseInt(e.target.value)})} required min="0" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>{t('inventory.minimumStock')}</label>
                                  <input type="number" value={addProductData.minimumStock} onChange={(e) => setAddProductData({...addProductData, minimumStock: parseInt(e.target.value)})} min="0" />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="btn-success btn-sm" disabled={!selectedProductId}>✓ {t('warehouses.create')}</button>
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
                                  <th>{t('products.unitsPerProduct')}</th>
                                  <th>{t('warehouses.quantity')}</th>
                                  <th>{t('warehouses.price')}</th>
                                  <th>{t('warehouses.actions')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {warehouse.products.map((product) => (
                                  <tr key={product.id}>
                                    <td><strong>{product.name}</strong></td>
                                    <td>
                                      <span className="badge" style={{ background: product.category === 'Paints' ? '#8b5cf6' : product.category === 'Iron' ? '#64748b' : 'var(--info)', color: '#fff' }}>
                                        {product.category === 'Paints' ? '🎨' : product.category === 'Iron' ? '🚪' : '📦'} {t(`categories.${product.category}`)}
                                      </span>
                                    </td>
                                    <td><span className="badge badge-neutral">{(product as any).unitsPerProduct || 1} units</span></td>
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
