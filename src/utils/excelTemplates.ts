import * as XLSX from 'xlsx';

/**
 * Generates a mining operations report Excel template
 */
export function generateReportTemplate() {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Mining Operations Report'],
    ['Generated:', new Date().toLocaleDateString()],
    [''],
    ['Report Configuration'],
    ['Title:', ''],
    ['Description:', ''],
    ['Date Range:', '', 'From:', '', 'To:', ''],
    [''],
    ['Summary Statistics'],
    ['Total Production (tons):', ''],
    ['Average Recovery Rate (%):', ''],
    ['Equipment Uptime (%):', ''],
    ['Critical Alerts:', ''],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // KPIs Sheet
  const kpiData = [
    ['Key Performance Indicators'],
    [''],
    ['Metric', 'Current Value', 'Target', 'Status', 'Trend'],
    ['Production Rate (tons/hr)', '', '', '', ''],
    ['Recovery Rate (%)', '', '', '', ''],
    ['Equipment Efficiency (%)', '', '', '', ''],
    ['Energy Consumption (kWh)', '', '', '', ''],
    ['Water Usage (m³)', '', '', '', ''],
    ['Safety Incidents', '', '', '', ''],
  ];
  const wsKPI = XLSX.utils.aoa_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKPI, 'KPIs');

  // Production Data Sheet
  const productionData = [
    ['Production Metrics'],
    [''],
    ['Timestamp', 'Section', 'Material', 'Quantity (tons)', 'Grade (%)', 'Recovery (%)', 'Notes'],
    // Sample rows
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];
  const wsProduction = XLSX.utils.aoa_to_sheet(productionData);
  XLSX.utils.book_append_sheet(wb, wsProduction, 'Production');

  // Equipment Status Sheet
  const equipmentData = [
    ['Equipment Status'],
    [''],
    ['Equipment ID', 'Name', 'Type', 'Status', 'Uptime (%)', 'Last Maintenance', 'Next Maintenance', 'Notes'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
  ];
  const wsEquipment = XLSX.utils.aoa_to_sheet(equipmentData);
  XLSX.utils.book_append_sheet(wb, wsEquipment, 'Equipment');

  // Alerts Sheet
  const alertsData = [
    ['Alerts & Incidents'],
    [''],
    ['Timestamp', 'Severity', 'Category', 'Description', 'Equipment', 'Status', 'Resolution'],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];
  const wsAlerts = XLSX.utils.aoa_to_sheet(alertsData);
  XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alerts');

  // Parameters Sheet
  const parametersData = [
    ['Critical Parameters'],
    [''],
    ['Parameter', 'Current Value', 'Min Threshold', 'Max Threshold', 'Unit', 'Status', 'Last Updated'],
    ['pH Level', '', '', '', '', '', ''],
    ['Temperature', '', '', '', '°C', '', ''],
    ['Pressure', '', '', '', 'bar', '', ''],
    ['Flow Rate', '', '', '', 'm³/h', '', ''],
    ['Concentration', '', '', '', 'g/L', '', ''],
  ];
  const wsParameters = XLSX.utils.aoa_to_sheet(parametersData);
  XLSX.utils.book_append_sheet(wb, wsParameters, 'Parameters');

  return wb;
}

/**
 * Downloads the Excel template
 */
export function downloadReportTemplate(filename: string = 'mining_report_template.xlsx') {
  const wb = generateReportTemplate();
  XLSX.writeFile(wb, filename);
}

/**
 * Generates a populated report with actual data
 */
export function generatePopulatedReport(reportConfig: any, data: any) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet with actual data
  const summaryData = [
    ['Mining Operations Report'],
    ['Generated:', new Date().toLocaleDateString()],
    [''],
    ['Report Configuration'],
    ['Title:', reportConfig.title || ''],
    ['Description:', reportConfig.description || ''],
    ['Date Range:', '', 'From:', reportConfig.dateRange?.from || '', 'To:', reportConfig.dateRange?.to || ''],
    [''],
    ['Summary Statistics'],
    ['Total Production (tons):', data.totalProduction || 0],
    ['Average Recovery Rate (%):', data.avgRecovery || 0],
    ['Equipment Uptime (%):', data.equipmentUptime || 0],
    ['Critical Alerts:', data.criticalAlerts || 0],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Add other sheets based on selected sections
  if (reportConfig.sections?.kpis && data.kpis) {
    const kpiData = [
      ['Key Performance Indicators'],
      [''],
      ['Metric', 'Current Value', 'Unit', 'Target', 'Change (%)', 'Status'],
      ...data.kpis.map((kpi: any) => [
        kpi.title || '',
        kpi.value || 0,
        kpi.unit || '',
        kpi.target || '',
        kpi.change || 0,
        kpi.status || ''
      ])
    ];
    const wsKPI = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKPI, 'KPIs');
  }

  if (reportConfig.sections?.production && data.production) {
    const productionData = [
      ['Production Metrics'],
      [''],
      ['Time', 'Throughput (tons/hr)', 'Target (tons/hr)', 'Efficiency (%)'],
      ...data.production.map((item: any) => [
        item.time || '',
        item.throughput || 0,
        item.target || 0,
        item.efficiency || 0
      ])
    ];
    const wsProduction = XLSX.utils.aoa_to_sheet(productionData);
    XLSX.utils.book_append_sheet(wb, wsProduction, 'Production');
  }

  if (reportConfig.sections?.equipment && data.equipment) {
    const equipmentData = [
      ['Equipment Status'],
      [''],
      ['Equipment ID', 'Name', 'Type', 'Status', 'Health (%)', 'Temperature (°C)', 'Power (kW)', 'Efficiency (%)', 'Last Maintenance', 'Next Maintenance'],
      ...data.equipment.map((eq: any) => [
        eq.id || '',
        eq.name || '',
        eq.type || '',
        eq.status || '',
        eq.health || 0,
        eq.temperature || 0,
        eq.powerUsage || 0,
        eq.efficiency || 0,
        eq.lastMaintenance || '',
        eq.nextMaintenance || ''
      ])
    ];
    const wsEquipment = XLSX.utils.aoa_to_sheet(equipmentData);
    XLSX.utils.book_append_sheet(wb, wsEquipment, 'Equipment');
  }

  if (reportConfig.sections?.alerts && data.alerts) {
    const alertsData = [
      ['Alerts & Incidents'],
      [''],
      ['Alert ID', 'Timestamp', 'Severity', 'Message', 'Equipment', 'Prediction'],
      ...data.alerts.map((alert: any) => [
        alert.id || '',
        alert.timestamp || '',
        alert.severity || '',
        alert.message || '',
        alert.equipment || '',
        alert.prediction ? 'Yes' : 'No'
      ])
    ];
    const wsAlerts = XLSX.utils.aoa_to_sheet(alertsData);
    XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alerts');
  }

  return wb;
}

/**
 * Downloads a populated report
 */
export function downloadPopulatedReport(
  reportConfig: any,
  data: any,
  filename: string = 'mining_operations_report.xlsx'
) {
  const wb = generatePopulatedReport(reportConfig, data);
  XLSX.writeFile(wb, filename);
}
