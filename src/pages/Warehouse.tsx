import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Package, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types/warehouse';
import { WarehouseSection } from '../components/warehouse/WarehouseSection';
import { ProductList } from '../components/warehouse/ProductList';
import { ProductModal } from '../components/warehouse/ProductModal';
import { ProductContextMenu } from '../components/warehouse/ProductContextMenu';
import { ProductDetails } from '../components/warehouse/ProductDetails';
import { TransactionHistory } from '../components/warehouse/TransactionHistory';
import { QRCodeModal } from '../components/warehouse/QRCodeModal';
import { showErrorNotification } from '../utils/notifications';

export const Warehouse: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<'all' | '1' | '2' | '3'>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    // Вычисляем общую стоимость всех товаров
    const total = products.reduce((sum, product) => {
      return sum + ((product.quantity || 0) * (product.averagePurchasePrice || 0));
    }, 0);
    setTotalValue(total);
  }, [products]);

  useEffect(() => {
    const constraints: any[] = [orderBy('order', 'asc')];
    
    if (selectedWarehouse !== 'all') {
      constraints.push(where('warehouse', '==', selectedWarehouse));
    }
    
    if (showLowStock) {
      constraints.unshift(where('quantity', '<=', 5));
    }
    
    const q = query(collection(db, 'products'), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        order: index + 1
      })) as Product[];
      
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedWarehouse, showLowStock]);

  const handleContextMenu = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedProduct(product);
    setShowContextMenu(true);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleViewHistory = async (product: Product) => {
    try {
      setSelectedProduct(product);
      setShowHistory(true);
    } catch (error) {
      showErrorNotification('Не удалось загрузить историю транзакций');
    }
  };

  const handleViewQRCode = (product: Product) => {
    setSelectedProduct(product);
    setShowQRCode(true);
  };

  const filteredProducts = products.filter(product => {
    const searchString = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchString) ||
      product.category?.toLowerCase().includes(searchString)
    );
  });

  if (showProductDetails && selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setShowProductDetails(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-4">
            <div className="flex items-center">
              <button onClick={() => window.history.back()} className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Склад</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium text-emerald-600">
                      {totalValue.toLocaleString()} ₸
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/warehouse/income/new')}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Приход
                      </button>
                      <button
                        onClick={() => navigate('/warehouse/expense/new')}
                        className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Расход
                      </button>
                      <button 
                        onClick={() => navigate('/warehouse/documents')}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                        title="Документы"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value as 'all' | '1' | '2' | '3')}
                className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm h-10 w-[48%] sm:w-auto"
              >
                <option value="all">Все склады</option>
                <option value="1">Склад 1</option>
                <option value="2">Склад 2</option>
                <option value="3">Склад 3</option>
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors w-full sm:w-auto justify-center h-10"
              >
                <Plus className="w-5 h-5 mr-1" />
                Добавить товар
              </button>
            </div>
          </div>
          
          <div className="py-2 sm:py-4 overflow-x-hidden">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Поиск по названию или категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm h-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-2 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Показать товары с остатком менее 5 шт
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Нет товаров</h3>
            <p className="text-gray-500">
              {searchQuery ? 'По вашему запросу ничего не найдено' : 'Добавьте первый товар'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Все товары */}
            <WarehouseSection
              title="Товары со всех складов"
              subtitle="Общий список"
              products={filteredProducts}
              onContextMenu={handleContextMenu}
              onProductClick={handleProductClick}
              onViewHistory={handleViewHistory}
              onViewQRCode={handleViewQRCode}
              warehouse="all"
            />

            {selectedWarehouse === 'all' || selectedWarehouse === '1' ? (
              <WarehouseSection
                title="Склад 1"
                subtitle="Основной склад"
                products={filteredProducts.filter(p => p.warehouse === '1')}
                onContextMenu={handleContextMenu}
                onProductClick={handleProductClick}
                onViewHistory={handleViewHistory}
                onViewQRCode={handleViewQRCode}
                warehouse="1"
              />
            ) : null}
            
            {selectedWarehouse === 'all' || selectedWarehouse === '2' ? (
              <WarehouseSection
                title="Склад 2"
                subtitle="Дополнительный склад"
                products={filteredProducts.filter(p => p.warehouse === '2')}
                onContextMenu={handleContextMenu}
                onProductClick={handleProductClick}
                onViewHistory={handleViewHistory}
                onViewQRCode={handleViewQRCode}
                warehouse="2"
              />
            ) : null}
            
            {selectedWarehouse === 'all' || selectedWarehouse === '3' ? (
              <WarehouseSection
                title="Склад 3"
                subtitle="Резервный склад"
                products={filteredProducts.filter(p => p.warehouse === '3')}
                onContextMenu={handleContextMenu}
                onProductClick={handleProductClick}
                onViewHistory={handleViewHistory}
                onViewQRCode={handleViewQRCode}
                warehouse="3"
              />
            ) : null}
          </div>
        )}
      </div>

      {showAddModal && (
        <ProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            showErrorNotification('Товар успешно добавлен');
          }}
        />
      )}

      {showContextMenu && selectedProduct && (
        <ProductContextMenu
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
          onEdit={() => {
            setShowContextMenu(false);
            setShowAddModal(true);
          }}
          onDelete={() => {
            setShowContextMenu(false);
            // Handle delete
          }}
          onMove={() => {
            setShowContextMenu(false);
            // Handle move
          }}
          productName={selectedProduct.name}
        />
      )}

      {showHistory && selectedProduct && (
        <TransactionHistory
          product={selectedProduct}
          isOpen={showHistory}
          onClose={() => {
            setShowHistory(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showQRCode && selectedProduct && (
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => {
            setShowQRCode(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};