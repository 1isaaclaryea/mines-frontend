import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { readExcelFromUrl, getSheetData } from './readExcelFile';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Creates a chart and returns it as a base64 image
 */
async function createChartImage(config: ChartConfiguration, width: number = 600, height: number = 400): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const chart = new Chart(canvas, config);
    
    // Wait for chart to render
    setTimeout(() => {
      const imageData = canvas.toDataURL('image/png');
      chart.destroy();
      resolve(imageData);
    }, 500);
  });
}

/**
 * Generates a PDF report from the Prod Stats sheet
 */
export async function generateProdStatsPDF(reportConfig: any) {
  try {
    // Read the Excel file and get both sheets
    const workbook = await readExcelFromUrl('/Production Update November 25.xlsx');
    
    // Get Prod Stats data
    const rawData = getSheetData(workbook, 'Prod Stats') as any[][];
    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in Prod Stats sheet');
    }

    // Convert Prod Stats array to objects
    const headers = rawData[0].map((h: any, idx: number) => 
      h && String(h).trim() ? String(h).trim() : `Column_${idx}`
    );
    
    const prodStatsData = rawData.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx] !== undefined ? row[idx] : '';
      });
      return obj;
    });

    // Get KPI's vs OZ +Carbon Column data
    const kpiOzRawData = getSheetData(workbook, "KPI`s vs  OZ +Carbon Column") as any[][];
    
    console.log('Raw KPI Data (first 5 rows):', kpiOzRawData.slice(0, 5));
    
    // Find the header row - look for row with "Plant Budget KPI's" or similar
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, kpiOzRawData.length); i++) {
      const row = kpiOzRawData[i];
      const rowStr = row.join('|').toLowerCase();
      if (rowStr.includes('plant') || rowStr.includes('kpi') || rowStr.includes('budget')) {
        headerRowIndex = i;
        console.log('Found header row at index:', i);
        break;
      }
    }
    
    const kpiOzHeaders = kpiOzRawData[headerRowIndex]?.map((h: any, idx: number) => 
      h && String(h).trim() ? String(h).trim() : `Column_${idx}`
    ) || [];
    
    console.log('KPI Headers from row', headerRowIndex, ':', kpiOzHeaders);
    
    const kpiOzData = kpiOzRawData.slice(headerRowIndex + 1).map(row => {
      const obj: any = {};
      kpiOzHeaders.forEach((header, idx) => {
        obj[header] = row[idx] !== undefined ? row[idx] : '';
      });
      return obj;
    });

    // Initialize PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add header
    pdf.setFillColor(41, 128, 185);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Production Statistics Report', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reportConfig.title || 'Mining Operations', pageWidth / 2, 30, { align: 'center' });
    
    // Add date
    pdf.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated: ${dateStr}`, pageWidth / 2, 35, { align: 'center' });

    yPosition = 50;

    // Reset text color for body
    pdf.setTextColor(0, 0, 0);

    // Add summary section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Calculate summary statistics
    const totalRecords = prodStatsData.length;
    const columns = headers; // Use the headers we extracted
    
    // Find numeric columns for calculations
    const numericColumns = columns.filter(col => {
      const value = prodStatsData[0]?.[col];
      return value !== '' && (typeof value === 'number' || !isNaN(parseFloat(value)));
    });

    pdf.text(`Total Records: ${totalRecords}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Date Range: ${reportConfig.dateRange?.from || 'N/A'} to ${reportConfig.dateRange?.to || 'N/A'}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Data Columns: ${columns.length}`, 15, yPosition);
    yPosition += 15;

    // Add data table
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Production Data', 15, yPosition);
    yPosition += 8;

    // Clean column names - handle Column_X placeholders
    const cleanColumnName = (col: string, index: number): string => {
      if (col.startsWith('Column_')) {
        return `Col ${index + 1}`;
      }
      return col;
    };

    // Prepare table data - include ALL columns
    const tableHeaders = columns.map((col, idx) => cleanColumnName(col, idx));
    const tableData = prodStatsData.slice(0, 15).map(row => 
      columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'number') return value.toFixed(2);
        return String(value);
      })
    );

    autoTable(pdf, {
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      bodyStyles: {
        fontSize: 6,
        cellPadding: 1
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 10, right: 10 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        // Make columns fit by adjusting width
        0: { cellWidth: 'auto' }
      }
    });

    // Get the final Y position after the table
    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Add new page for charts
    pdf.addPage();
    yPosition = 20;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data Visualizations', 15, yPosition);
    yPosition += 15;

    // Create Bar Chart - First numeric column over records
    if (numericColumns.length > 0) {
      const firstNumericCol = numericColumns[0];
      const cleanFirstColName = cleanColumnName(firstNumericCol, numericColumns.indexOf(firstNumericCol));
      
      const chartData = prodStatsData.slice(0, 10).map((row, idx) => ({
        label: row[columns[0]] || `Record ${idx + 1}`,
        value: parseFloat(row[firstNumericCol]) || 0
      }));

      const barChartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: chartData.map(d => String(d.label).substring(0, 15)),
          datasets: [{
            label: cleanFirstColName,
            data: chartData.map(d => d.value),
            backgroundColor: 'rgba(41, 128, 185, 0.7)',
            borderColor: 'rgba(41, 128, 185, 1)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          plugins: {
            title: {
              display: true,
              text: `${cleanFirstColName} Distribution`,
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.1)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      };

      const barChartImage = await createChartImage(barChartConfig, 800, 400);
      pdf.addImage(barChartImage, 'PNG', 15, yPosition, 180, 90);
      yPosition += 100;
    }

    // Create Pie Chart - Distribution of categories or top values
    if (numericColumns.length > 0) {
      const pieDataCol = numericColumns[0];
      const cleanPieColName = cleanColumnName(pieDataCol, numericColumns.indexOf(pieDataCol));
      
      const pieData = prodStatsData.slice(0, 6).map((row, idx) => ({
        label: row[columns[0]] || `Category ${idx + 1}`,
        value: Math.abs(parseFloat(row[pieDataCol]) || 0)
      }));

      const colors = [
        'rgba(41, 128, 185, 0.8)',
        'rgba(231, 76, 60, 0.8)',
        'rgba(46, 204, 113, 0.8)',
        'rgba(241, 196, 15, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(230, 126, 34, 0.8)'
      ];

      const pieChartConfig: ChartConfiguration = {
        type: 'pie',
        data: {
          labels: pieData.map(d => String(d.label).substring(0, 20)),
          datasets: [{
            data: pieData.map(d => d.value),
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          plugins: {
            title: {
              display: true,
              text: `${cleanPieColName} Distribution`,
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: true,
              position: 'right'
            }
          }
        }
      };

      const pieChartImage = await createChartImage(pieChartConfig, 800, 400);
      pdf.addImage(pieChartImage, 'PNG', 15, yPosition, 180, 90);
    }

    // Add new page for KPI's vs OZ +Carbon Column data
    pdf.addPage();
    yPosition = 20;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("KPI's vs OZ + Carbon Column", 15, yPosition);
    yPosition += 10;

    // Add KPI vs OZ table - only first 5 rows
    if (kpiOzData.length > 0) {
      const kpiTableHeaders = kpiOzHeaders.filter(h => !h.startsWith('Column_'));
      const kpiTableData = kpiOzData.slice(0, 5).map(row => 
        kpiTableHeaders.map(col => {
          const value = row[col];
          if (value === null || value === undefined || value === '') return '-';
          if (typeof value === 'number') return value.toFixed(2);
          return String(value);
        })
      );

      autoTable(pdf, {
        head: [kpiTableHeaders],
        body: kpiTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 15, right: 15 }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Create 3D-style bar chart for Impact of Plant KPI's on Gold Produced
    // The Excel structure has KPI names in rows, not columns
    // We need to find rows with specific KPI names and extract impact values
    
    console.log('KPI Headers:', kpiOzHeaders);
    console.log('KPI Data Sample (first 3):', kpiOzData.slice(0, 3));
    console.log('Total KPI rows:', kpiOzData.length);
    
    // The impact data is in the last column (rightmost)
    // KPI names are in the first column (leftmost)
    const impactData: Array<{name: string, value: number}> = [];
    
    // Find the impact column index
    const impactColName = kpiOzHeaders.find(h => 
      String(h).toLowerCase().includes('impact')
    );
    console.log('Impact column name:', impactColName);
    
    // Search through all rows to find the KPIs
    for (const row of kpiOzData) {
      // Check all columns for KPI names
      for (let colIdx = 0; colIdx < kpiOzHeaders.length; colIdx++) {
        const cellValue = String(row[kpiOzHeaders[colIdx]] || '').trim();
        
        if (['Tonnes Milled', 'Head Grade', 'Recovery'].includes(cellValue)) {
          console.log(`Found KPI: ${cellValue} in column ${colIdx}`);
          console.log('Full row:', row);
          console.log('All row values:', Object.entries(row));
          
          // Try to find the impact value in the "Impact of the KPI to Oz produced" column
          let rawValue = impactColName ? row[impactColName] : null;
          
          // If not found, try all numeric columns from right to left
          if (!rawValue || rawValue === '') {
            console.log('Impact column empty, searching all columns...');
            for (let i = kpiOzHeaders.length - 1; i >= 0; i--) {
              const testValue = row[kpiOzHeaders[i]];
              console.log(`Column ${i} (${kpiOzHeaders[i]}):`, testValue, typeof testValue);
              if (testValue && testValue !== '' && !isNaN(parseFloat(String(testValue)))) {
                // Check if this looks like an impact value (reasonable range)
                const numVal = parseFloat(String(testValue));
                if (Math.abs(numVal) < 1000 && Math.abs(numVal) > 0.01) {
                  rawValue = testValue;
                  console.log(`Using value from column ${i}:`, rawValue);
                  break;
                }
              }
            }
          }
          
          console.log(`Impact value for ${cellValue}:`, rawValue);
          
          // Parse the impact value
          let impactValue = 0;
          if (typeof rawValue === 'number') {
            impactValue = rawValue;
          } else if (typeof rawValue === 'string' && rawValue.trim()) {
            // Remove commas and handle parentheses for negative numbers
            let cleanValue = rawValue.replace(/,/g, '');
            if (cleanValue.includes('(') && cleanValue.includes(')')) {
              cleanValue = '-' + cleanValue.replace(/[()]/g, '');
            }
            impactValue = parseFloat(cleanValue) || 0;
          }
          
          console.log(`${cellValue}: ${rawValue} -> ${impactValue}`);
          impactData.push({ name: cellValue, value: impactValue });
          break; // Found the KPI in this row, move to next row
        }
      }
    }

    console.log('Impact Data for Chart:', impactData);
    
    if (impactData.length > 0 && yPosition + 100 < pageHeight) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Impact of Plant KPI\'s on Gold Produced', 15, yPosition);
      yPosition += 10;

      const impactChartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: impactData.map(d => d.name),
          datasets: [{
            label: 'Impact (Oz)',
            data: impactData.map(d => d.value),
            backgroundColor: impactData.map(d => 
              d.value < 0 ? 'rgba(231, 76, 60, 0.8)' : 'rgba(46, 204, 113, 0.8)'
            ),
            borderColor: impactData.map(d => 
              d.value < 0 ? 'rgba(231, 76, 60, 1)' : 'rgba(46, 204, 113, 1)'
            ),
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          indexAxis: 'x',
          plugins: {
            title: {
              display: true,
              text: 'Impact of Plant KPI\'s on Gold Produced',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              title: {
                display: true,
                text: 'Impact (Oz)',
                font: { size: 12, weight: 'bold' }
              },
              ticks: {
                font: { size: 11 }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 11, weight: 'bold' }
              }
            }
          }
        }
      };

      const impactChartImage = await createChartImage(impactChartConfig, 800, 400);
      pdf.addImage(impactChartImage, 'PNG', 15, yPosition, 180, 90);
    }

    // Add footer to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${i} of ${totalPages} | Mining Operations Analytics Platform`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Download the PDF
    const filename = `Production_Stats_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return { success: true, filename };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
