/**
 * Utilitários para exportar relatórios em PDF e Excel
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// ==================== PDF ====================

export interface PDFReportData {
  tenantName: string;
  reportTitle: string;
  period: { start: string; end: string };
  revenue?: { data: Array<Record<string, string | number>> };
  status?: { total: number; data: Array<Record<string, string | number>> };
  topServices?: Array<Record<string, string | number>>;
  professionals?: Array<Record<string, string | number>>;
}

export function exportReportToPDF(data: PDFReportData) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.reportTitle, 105, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tenantName, 105, yPos, { align: 'center' });
  yPos += 7;

  doc.setFontSize(10);
  doc.text(
    `Período: ${format(new Date(data.period.start), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(data.period.end), 'dd/MM/yyyy', { locale: ptBR })}`,
    105,
    yPos,
    { align: 'center' }
  );
  yPos += 15;

  // Distribuição de Status
  if (data.status) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribuição por Status', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Quantidade', 'Percentual']],
      body: data.status.data.map((item) => [
        item.status_display,
        (item.count as number).toString(),
        `${(item.percentage as number).toFixed(2)}%`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Top Serviços
  if (data.topServices && data.topServices.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Serviços', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Serviço', 'Agendamentos', 'Receita']],
      body: data.topServices.map((item) => [
        item.service_name,
        (item.appointments_count as number).toString(),
        formatCurrency(parseFloat(item.total_revenue as string)),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Nova página se necessário
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Desempenho Profissional
  if (data.professionals && data.professionals.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Desempenho por Profissional', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Profissional', 'Agendamentos', 'Concluídos', 'Taxa', 'Receita']],
      body: data.professionals.map((item) => [
        item.professional_name,
        (item.total_appointments as number).toString(),
        (item.completed as number).toString(),
        `${(item.completion_rate as number).toFixed(1)}%`,
        formatCurrency(item.total_revenue as number),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });
  }

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Salvar
  const fileName = `relatorio_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  doc.save(fileName);
}

// ==================== EXCEL ====================

export interface ExcelReportData {
  tenantName: string;
  period: { start: string; end: string };
  revenue?: { data: Array<Record<string, string | number>> };
  status?: { total: number; data: Array<Record<string, string | number>> };
  topServices?: Array<Record<string, string | number>>;
  professionals?: Array<Record<string, string | number>>;
}

export function exportReportToExcel(data: ExcelReportData) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Resumo
  const summaryData = [
    ['Relatório de Desempenho'],
    [data.tenantName],
    [`Período: ${format(new Date(data.period.start), 'dd/MM/yyyy')} a ${format(new Date(data.period.end), 'dd/MM/yyyy')}`],
    [],
  ];

  // Sheet 2: Distribuição de Status
  if (data.status) {
    summaryData.push(['Distribuição por Status'], ['Status', 'Quantidade', 'Percentual']);
    data.status.data.forEach((item) => {
      summaryData.push([
        String(item.status_display), 
        String(item.count), 
        `${(item.percentage as number).toFixed(2)}%`
      ]);
    });
    summaryData.push([]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  // Sheet 3: Top Serviços
  if (data.topServices && data.topServices.length > 0) {
    const servicesData = [
      ['Top Serviços'],
      [],
      ['Serviço', 'Preço', 'Agendamentos', 'Receita Total'],
    ];

    data.topServices.forEach((item) => {
      servicesData.push([
        String(item.service_name),
        String(typeof item.price === 'number' ? item.price : parseFloat(String(item.price))),
        String(item.appointments_count),
        String(typeof item.total_revenue === 'number' ? item.total_revenue : parseFloat(String(item.total_revenue))),
      ]);
    });

    const servicesSheet = XLSX.utils.aoa_to_sheet(servicesData);
    XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Top Serviços');
  }

  // Sheet 4: Desempenho Profissional
  if (data.professionals && data.professionals.length > 0) {
    const professionalsData = [
      ['Desempenho por Profissional'],
      [],
      [
        'Profissional',
        'Email',
        'Total Agendamentos',
        'Concluídos',
        'Cancelados',
        'Taxa de Conclusão (%)',
        'Receita Total',
      ],
    ];

    data.professionals.forEach((item) => {
      professionalsData.push([
        String(item.professional_name),
        String(item.professional_email),
        String(item.total_appointments),
        String(item.completed),
        String(item.cancelled),
        String(item.completion_rate),
        String(item.total_revenue),
      ]);
    });

    const professionalsSheet = XLSX.utils.aoa_to_sheet(professionalsData);
    XLSX.utils.book_append_sheet(workbook, professionalsSheet, 'Profissionais');
  }

  // Sheet 5: Receita (se disponível)
  if (data.revenue && data.revenue.data.length > 0) {
    const revenueData = [['Receita ao Longo do Tempo'], [], ['Data', 'Receita', 'Quantidade']];

    data.revenue.data.forEach((item) => {
      revenueData.push([
        format(new Date(item.period), 'dd/MM/yyyy'),
        String(typeof item.total === 'number' ? item.total : parseFloat(String(item.total))),
        String(item.count),
      ]);
    });

    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Receita');
  }

  // Salvar
  const fileName = `relatorio_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ==================== EXCEL SIMPLES (Tabela única) ====================

export function exportTableToExcel(
  data: Record<string, unknown>[],
  columns: { header: string; key: string }[],
  fileName: string
) {
  // Criar dados para o Excel
  const excelData: unknown[][] = [columns.map((col) => col.header)];

  data.forEach((row) => {
    const rowData = columns.map((col) => row[col.key]);
    excelData.push(rowData);
  });

  // Criar workbook
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

  // Salvar
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
}

// ==================== CSV ====================

export interface CSVReportData {
  tenantName: string;
  period: { start: string; end: string };
  status?: { total: number; data: Array<Record<string, string | number>> };
  topServices?: Array<Record<string, string | number>>;
  professionals?: Array<Record<string, string | number>>;
}

export function exportReportToCSV(data: CSVReportData) {
  let csvContent = '\uFEFF'; // UTF-8 BOM
  
  // Header
  csvContent += `Relatório de Desempenho\n`;
  csvContent += `${data.tenantName}\n`;
  csvContent += `Período:,${format(new Date(data.period.start), 'dd/MM/yyyy')} a ${format(new Date(data.period.end), 'dd/MM/yyyy')}\n\n`;

  // Distribuição de Status
  if (data.status) {
    csvContent += `Distribuição por Status\n`;
    csvContent += `Status,Quantidade,Percentual\n`;
    data.status.data.forEach((item) => {
      csvContent += `${item.status_display},${item.count},${(item.percentage as number).toFixed(2)}%\n`;
    });
    csvContent += `\n`;
  }

  // Top Serviços
  if (data.topServices && data.topServices.length > 0) {
    csvContent += `Top Serviços\n`;
    csvContent += `Serviço,Preço,Agendamentos,Receita Total\n`;
    data.topServices.forEach((item) => {
      csvContent += `${item.service_name},${item.price},${item.appointments_count},${item.total_revenue}\n`;
    });
    csvContent += `\n`;
  }

  // Desempenho Profissional
  if (data.professionals && data.professionals.length > 0) {
    csvContent += `Desempenho por Profissional\n`;
    csvContent += `Profissional,Email,Total Agendamentos,Concluídos,Cancelados,Taxa de Conclusão (%),Receita Total\n`;
    data.professionals.forEach((item) => {
      csvContent += `${item.professional_name},${item.professional_email},${item.total_appointments},${item.completed},${item.cancelled},${item.completion_rate},${item.total_revenue}\n`;
    });
  }

  // Criar blob e fazer download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
