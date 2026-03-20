'use client';

import { useState } from 'react';
import '@/app/styles/globals.css';

export default function SeriesPreview({ seriesData, onClose }) {
  const seriesList = seriesData?.series || [];
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);

  if (seriesList.length === 0) return null;

  const renderCell = (cellValue) => {
    if (!cellValue) return '';
    if (typeof cellValue === 'string' && cellValue.match(/\.pdf$/i)) {
      return <a href={cellValue} target="_blank" rel="noopener noreferrer" className="series-download-link">PDF</a>;
    }
    if (typeof cellValue === 'string' && (cellValue.includes('sub06') || cellValue.match(/\.dwg$/i))) {
      return <a href="/support/downloads" className="series-download-link">DWG</a>;
    }
    if (typeof cellValue === 'string' && cellValue.includes('\n')) {
      return cellValue.split('\n').map((line, i) => (
        <span key={i}>{line}{i < cellValue.split('\n').length - 1 && <br />}</span>
      ));
    }
    return cellValue;
  };

  const activeSeries = seriesList[activeSeriesIndex];
  if (!activeSeries) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="series-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{activeSeries.name}</h2>

        {seriesList.length > 1 && (
          <div className="series-tabs">
            {seriesList.map((series, idx) => (
              <button
                key={idx}
                className={`series-tab ${idx === activeSeriesIndex ? 'active' : ''}`}
                onClick={() => setActiveSeriesIndex(idx)}
              >
                {series.name.replace(' Series List', '')}
              </button>
            ))}
          </div>
        )}

        <div className="series-table-wrapper">
          <table className="series-table">
            <thead>
              <tr>
                {activeSeries.columns.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSeries.rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>{renderCell(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
