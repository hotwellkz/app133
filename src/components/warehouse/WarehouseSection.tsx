import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Product } from '../../types/warehouse';
import { ProductList } from './ProductList';

interface WarehouseSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  onContextMenu: (e: React.MouseEvent, product: Product) => void;
  onProductClick: (product: Product) => void;
  onViewHistory: (product: Product) => void;
  onViewQRCode: (product: Product) => void;
  warehouse: 'all' | '1' | '2' | '3';
}

export const WarehouseSection: React.FC<WarehouseSectionProps> = ({
  title,
  subtitle,
  products,
  onContextMenu,
  onProductClick,
  onViewHistory,
  onViewQRCode,
  warehouse
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getStatusColor = () => {
    switch (warehouse) {
      case 'all':
        return 'text-purple-500';
      case '1':
        return 'text-emerald-500';
      case '2':
        return 'text-amber-500';
      case '3':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBadgeColor = () => {
    switch (warehouse) {
      case 'all':
        return 'bg-purple-100 text-purple-600';
      case '1':
        return 'bg-emerald-100 text-emerald-600';
      case '2':
        return 'bg-amber-100 text-amber-600';
      case '3':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className={`w-5 h-5 ${getStatusColor()}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${getStatusColor()}`} />
          )}
          <Package className={`w-5 h-5 ${getStatusColor()}`} />
          <h3 className="font-medium text-gray-900">
            {title} ({products.length})
          </h3>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${getBadgeColor()}`}>
          {subtitle}
        </div>
      </div>
      
      {!isCollapsed && products.length > 0 && (
        <div className="space-y-2">
          <ProductList
            products={products}
            onContextMenu={onContextMenu}
            onProductClick={onProductClick}
            onViewHistory={onViewHistory}
            onViewQRCode={onViewQRCode}
          />
        </div>
      )}
    </div>
  );
};