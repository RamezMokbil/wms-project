import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productService, Product, ProductInput } from '../services/productService';
import { useToast } from '../contexts/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

const Products: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    category: '',
    sku: '',
    price: 0,
    description: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      addToast(t('products.noProducts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('products', ['Name', 'Category', 'SKU', 'Price', 'Description'], products.map(p => [p.name, p.category, p.sku, String(p.price), p.description || '']));
    addToast('CSV exported ✓');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.update(editingId, formData);
        addToast(t('products.update') + ' ✓');
      } else {
        await productService.create(formData);
        addToast(t('products.create') + ' ✓');
      }
      resetForm();
      loadProducts();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('warehouses.deleteConfirm'))) return;
    try {
      await productService.delete(id);
      addToast(t('products.delete') + ' ✓');
      loadProducts();
    } catch (error) {
      addToast('Error deleting product', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      price: product.price,
      description: product.description || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', sku: '', price: 0, description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>{t('products.title')}</h1>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={handleExportCsv}>📥 CSV</button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ ' + t('products.cancel') : '+ ' + t('products.addProduct')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? '✏️ ' + t('products.editProduct') : '📦 ' + t('products.newProduct')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('products.name')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('products.category')} *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Electronics"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('products.sku')} *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. SKU-001"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('products.price')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>{t('products.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingId ? '💾 ' + t('products.update') : '+ ' + t('products.create')}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>
                {t('products.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-neutral">
              {filteredProducts.length} {t('products.title')}
            </span>
            {categories.map((cat) => (
              <span key={cat} className="badge badge-info">{cat}</span>
            ))}
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
              <th>{t('products.name')}</th>
              <th>{t('products.category')}</th>
              <th>{t('products.sku')}</th>
              <th>{t('products.price')}</th>
              <th>{t('products.description')}</th>
              <th>{t('products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <div className="empty-state-text">{t('products.noProducts')}</div>
                    <div className="empty-state-sub">Add your first product to get started</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong></td>
                  <td><span className="badge badge-info">{product.category}</span></td>
                  <td><code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>{product.sku}</code></td>
                  <td><strong>${product.price.toFixed(2)}</strong></td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-warning btn-sm" onClick={() => handleEdit(product)}>
                        ✏️ {t('products.edit')}
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(product.id)}>
                        🗑 {t('products.delete')}
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

export default Products;
