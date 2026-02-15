import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productService, Product, ProductInput } from '../services/productService';
import { useToast } from '../contexts/ToastContext';
import { exportToCsv } from '../utils/exportCsv';

const CATEGORIES = [
  { key: 'Paints', icon: '🎨', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)', description: 'Art & Canvas' },
  { key: 'Iron', icon: '🚪', color: '#64748b', gradient: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)', description: 'Metal & Steel' },
];

const Products: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    category: 'Paints',
    price: 0,
    unitsPerProduct: 1,
    description: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = products;
    if (activeCategory) {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [searchTerm, products, activeCategory]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      addToast(t('products.noProducts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    exportToCsv('products', ['Name', 'Category', 'Price', 'Units/Product', 'Description'], filteredProducts.map(p => [p.name, p.category, String(p.price), String(p.unitsPerProduct || 1), p.description || '']));
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
      price: product.price,
      unitsPerProduct: product.unitsPerProduct || 1,
      description: product.description || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: activeCategory || 'Paints', price: 0, unitsPerProduct: 1, description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCategoryClick = (catKey: string) => {
    if (activeCategory === catKey) {
      setActiveCategory(null);
    } else {
      setActiveCategory(catKey);
      setFormData((prev) => ({ ...prev, category: catKey }));
    }
  };

  const getCategoryCount = (catKey: string) => products.filter((p) => p.category === catKey).length;

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
        <h1>{t('products.title')}</h1>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={handleExportCsv}>📥 CSV</button>
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); if (!showForm) setFormData((prev) => ({ ...prev, category: activeCategory || 'Paintings' })); }}>
            {showForm ? '✕ ' + t('products.cancel') : '+ ' + t('products.addProduct')}
          </button>
        </div>
      </div>

      {/* ---- Category Cards ---- */}
      <div className="category-cards">
        {CATEGORIES.map((cat) => {
          const count = getCategoryCount(cat.key);
          const isActive = activeCategory === cat.key;
          return (
            <div
              key={cat.key}
              className={`category-card ${isActive ? 'category-card--active' : ''}`}
              style={{ '--cat-color': cat.color, '--cat-gradient': cat.gradient } as React.CSSProperties}
              onClick={() => handleCategoryClick(cat.key)}
            >
              <div className="category-card__icon">{cat.icon}</div>
              <div className="category-card__info">
                <h3 className="category-card__title">{t(`categories.${cat.key}`)}</h3>
                <p className="category-card__desc">{t(`categories.${cat.key}Desc`)}</p>
              </div>
              <div className="category-card__count">{count}</div>
              {isActive && <div className="category-card__check">✓</div>}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="form-container" style={{ borderLeft: `4px solid ${CATEGORIES.find(c => c.key === formData.category)?.color || 'var(--primary)'}` }}>
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
                <div className="category-toggle">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`category-toggle__btn ${formData.category === cat.key ? 'category-toggle__btn--active' : ''}`}
                      style={{ '--cat-color': cat.color } as React.CSSProperties}
                      onClick={() => setFormData({ ...formData, category: cat.key })}
                    >
                      {cat.icon} {t(`categories.${cat.key}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-row">
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
              <div className="form-group">
                <label>{t('products.unitsPerProduct')} *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsPerProduct}
                  onChange={(e) => setFormData({ ...formData, unitsPerProduct: parseInt(e.target.value) || 1 })}
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
            {activeCategory && (
              <button className="btn-outline btn-sm" onClick={() => setActiveCategory(null)} style={{ fontSize: '0.75rem' }}>
                ✕ Clear filter
              </button>
            )}
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
              <th>{t('products.price')}</th>
              <th>{t('products.unitsPerProduct')}</th>
              <th>{t('products.description')}</th>
              <th>{t('products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">{activeCategory ? (CATEGORIES.find(c => c.key === activeCategory)?.icon || '📦') : '📦'}</div>
                    <div className="empty-state-text">{t('products.noProducts')}</div>
                    <div className="empty-state-sub">
                      {activeCategory ? `No ${activeCategory} products yet` : 'Add your first product to get started'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const catInfo = CATEGORIES.find(c => c.key === product.category);
                return (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td>
                      <span className="badge" style={{ background: catInfo?.color || 'var(--info)', color: '#fff' }}>
                        {catInfo?.icon || '📦'} {t(`categories.${product.category}`)}
                      </span>
                    </td>
                    <td><strong>${product.price.toFixed(2)}</strong></td>
                    <td><span className="badge badge-neutral">{product.unitsPerProduct || 1} units</span></td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
