/**
 * Export Utilities for INNEXA FIT reports
 */

export function exportToExcel(filename: string, headers: string[], rows: any[][]) {
  // Convert headers and rows to CSV format
  const csvRows = [];
  
  // Headers row
  csvRows.push(headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','));
  
  // Data rows
  for (const row of rows) {
    csvRows.push(row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','));
  }
  
  const csvContent = csvRows.join('\n');
  
  // Add UTF-8 BOM so Excel opens Arabic letters correctly!
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(
  title: string, 
  headers: string[], 
  rows: any[][], 
  summaryData?: { label: string; value: string }[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF.');
    return;
  }

  const currentDate = new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const summaryHTML = summaryData && summaryData.length > 0 
    ? `
      <div class="summary-section">
        <h3>ملخص التقرير / Summary</h3>
        <div class="summary-grid">
          ${summaryData.map(item => `
            <div class="summary-card">
              <span class="summary-label">${item.label}</span>
              <span class="summary-value">${item.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` 
    : '';

  const tableHeadersHTML = headers.map(h => `<th>${h}</th>`).join('');
  const tableRowsHTML = rows.map(row => `
    <tr>
      ${row.map(val => `<td>${val ?? ''}</td>`).join('')}
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        
        body {
          font-family: 'Cairo', 'Inter', sans-serif;
          color: #1a1a1a;
          background: #ffffff;
          margin: 0;
          padding: 20px;
          direction: rtl;
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #9333ea;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-name {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #000000;
        }

        .brand-name span {
          color: #9333ea;
        }

        .report-title-container {
          text-align: left;
        }

        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0;
          color: #9333ea;
        }

        .report-date {
          font-size: 11px;
          color: #666;
          margin-top: 5px;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        .report-table th {
          background-color: #f3e8ff;
          color: #6b21a8;
          font-weight: 700;
          padding: 12px 10px;
          border: 1px solid #e9d5ff;
          font-size: 12px;
          text-align: right;
        }

        .report-table td {
          padding: 12px 10px;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          text-align: right;
        }

        .report-table tr:nth-child(even) {
          background-color: #f8fafc;
        }

        .summary-section {
          background: #faf5ff;
          border: 1px solid #f3e8ff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .summary-section h3 {
          margin-top: 0;
          color: #6b21a8;
          font-size: 14px;
          margin-bottom: 15px;
          border-bottom: 1px dashed #e9d5ff;
          padding-bottom: 8px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .summary-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 10px 15px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-label {
          display: block;
          font-size: 10px;
          color: #666;
          margin-bottom: 5px;
        }

        .summary-value {
          font-size: 16px;
          font-weight: bold;
          color: #9333ea;
        }

        .footer {
          text-align: center;
          margin-top: 50px;
          font-size: 10px;
          color: #999;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }

        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="brand-logo">
          <span class="brand-name">INNEXA<span>FIT</span></span>
        </div>
        <div class="report-title-container">
          <h1 class="report-title">${title}</h1>
          <div class="report-date">تاريخ الاستخراج: ${currentDate}</div>
        </div>
      </div>

      ${summaryHTML}

      <table class="report-table">
        <thead>
          <tr>
            ${tableHeadersHTML}
          </tr>
        </thead>
        <tbody>
          ${tableRowsHTML}
        </tbody>
      </table>

      <div class="footer">
        هذا التقرير تم استخراجه إلكترونياً من منصة INNEXA FIT الرياضية.
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
