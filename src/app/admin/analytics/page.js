'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import OverviewTab from '@/components/analytics/OverviewTab';
import VisitorTab from '@/components/analytics/VisitorTab';
import DeviceTab from '@/components/analytics/DeviceTab';
import ProductRankTab from '@/components/analytics/ProductRankTab';
import PageRankTab from '@/components/analytics/PageRankTab';

const TABS = [
  { key: 'overview', label: '개요', icon: '📊' },
  { key: 'visitors', label: '접속 통계', icon: '👥' },
  { key: 'devices', label: '기기별 분석', icon: '📱' },
  { key: 'products', label: '제품 노출순위', icon: '🏆' },
  { key: 'pages', label: '인기 페이지', icon: '📄' },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'visitors': return <VisitorTab />;
      case 'devices': return <DeviceTab />;
      case 'products': return <ProductRankTab />;
      case 'pages': return <PageRankTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <AdminLayout title="접속 통계">
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-2px',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {renderTab()}
    </AdminLayout>
  );
}
