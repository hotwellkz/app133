import React from 'react';
import { Edit2, FolderInput, Trash2 } from 'lucide-react';

interface ProductContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
  productName: string;
}

export const ProductContextMenu: React.FC<ProductContextMenuProps> = ({
  position,
  onClose,
  onEdit,
  onDelete,
  onMove,
  productName
}) => {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
        {productName}
      </div>

      <button
        onClick={onEdit}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Редактировать
      </button>

      <button
        onClick={onMove}
        className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100 flex items-center gap-2"
      >
        <FolderInput className="w-4 h-4" />
        Переместить на другой склад
      </button>

      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Удалить
      </button>
    </div>
  );
};