'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProductManagementTab from '@/components/admin/products/ProductManagementTab';
import OptionManagementTab from '@/components/admin/products/OptionManagementTab';

const TABS = [
  { key: 'products', label: '제품 관리' },
  { key: 'options', label: '옵션관리' },
];

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState('products');

  const renderTab = () => {
    switch (activeTab) {
      case 'products': return <ProductManagementTab />;
      case 'options': return <OptionManagementTab />;
      default: return <ProductManagementTab />;
    }
  };

  return (
    <AdminLayout title="제품 관리">
      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb', background: 'white',
        borderRadius: '8px 8px 0 0', padding: '0 0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '1rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.key ? '600' : '400',
              color: activeTab === tab.key ? '#1f2937' : '#6b7280',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {renderTab()}
    </AdminLayout>
  );
}
