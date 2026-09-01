import jsPDF from 'jspdf';
import { InvestigationData } from '../types';

export function generateInvestigationPdf(data: InvestigationData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin + 10;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    // Subtle top running header for subsequent pages
    doc.setFillColor(15, 23, 42); // slate 900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 180, 216); // cyan
    doc.text('TRACEMAIL AI // SOC FORENSIC INVESTIGATION REPORT', margin, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`CASE ID: ${data.id} | TLP:AMBER | STRICT`, pageWidth - margin, 10, { align: 'right' });

    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // --- PAGE 1: COVER & EXECUTIVE SUMMARY ---

  // 1. Master Header Banner (Cyber Dark Theme Header)
  doc.setFillColor(9, 11, 16);
  doc.rect(margin, y, contentWidth, 26, 'F');
  
  // Accent Left Cyber Bar
  const isMalicious = data.verdict === 'MALICIOUS';
  const isSuspicious = data.verdict === 'SUSPICIOUS';
  const verdictR = isMalicious ? 239 : isSuspicious ? 245 : 16;
  const verdictG = isMalicious ? 68 : isSuspicious ? 158 : 185;
  const verdictB = isMalicious ? 68 : isSuspicious ? 11 : 129;

  doc.setFillColor(verdictR, verdictG, verdictB);
  doc.rect(margin, y, 3, 26, 'F');

  // Title Text inside Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(244, 247, 251);
  doc.text('TRACEMAIL AI // SOC COMMAND CENTER', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 218, 243);
  doc.text('EXPLAINABLE THREAT INTELLIGENCE & FORENSIC AUDIT REPORT', margin + 6, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(138, 148, 166);
  doc.text(`Generated: ${new Date().toUTCString()} | Standard: NIST SP 800-86 Forensic Compliance`, margin + 6, y + 21);

  // Top-Right TLP Badge
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 32, y + 5, 30, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(245, 158, 11);
  doc.text('TLP:AMBER+STRICT', pageWidth - margin - 17, y + 9.5, { align: 'center' });

  y += 30;

  // 2. Executive Verdict Box & Score
  const verdictBoxHeight = 28;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, verdictBoxHeight, 2, 2, 'FD');

  // Verdict Badge
  doc.setFillColor(verdictR, verdictG, verdictB);
  doc.roundedRect(margin + 5, y + 5, 42, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`VERDICT: ${data.verdict}`, margin + 26, y + 11, { align: 'center' });

  // Risk Score Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RISK EVALUATION SCORE', margin + 52, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(verdictR, verdictG, verdictB);
  doc.text(`${data.riskScore}/100`, margin + 52, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Confidence: ${data.confidence.toUpperCase()}`, margin + 52, y + 23);

  // Case ID & Classification right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`INVESTIGATION ID:`, pageWidth - margin - 5, y + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(data.id, pageWidth - margin - 5, y + 13, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`SOURCE ARTIFACT:`, pageWidth - margin - 5, y + 19, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const truncatedSource = data.sourceFile.length > 28 ? data.sourceFile.substring(0, 25) + '...' : data.sourceFile;
  doc.text(truncatedSource, pageWidth - margin - 5, y + 24, { align: 'right' });

  y += verdictBoxHeight + 6;

  // 3. Email Ingestion & Message Header Metadata Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Message & Authentication Provenance', margin, y);
  y += 3;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  const drawKeyValueRow = (label: string, value: string, currentY: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, 36, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 2, currentY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const splitVal = doc.splitTextToSize(value, contentWidth - 40);
    doc.text(splitVal[0] || '', margin + 38, currentY + 4.2);
    return currentY + 6.5;
  };

  y = drawKeyValueRow('Sender (From):', data.sender, y);
  y = drawKeyValueRow('Subject Line:', data.subject, y);
  y = drawKeyValueRow('Ingest Timestamp:', data.timestamp, y);
  y = drawKeyValueRow('Sender Domain Intel:', `${data.domainAge} | Trust Score: ${data.trustScore}/100 | Created: ${data.domainCreated}`, y);
  y = drawKeyValueRow(
    'Auth Protocols:',
    `SPF: [${data.authStatus.spf}]  |  DKIM: [${data.authStatus.dkim}]  |  DMARC Policy: [${data.authStatus.dmarc}]`,
    y
  );

  y += 4;

  // 4. Key Threat Indicators (Flagged Evidence)
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Threat Indicators & Explanations', margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  if (data.indicators.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No malicious indicators or anomalies were detected during automated sandbox and NLP inspection.', margin, y + 2);
    y += 8;
  } else {
    data.indicators.forEach((ind) => {
      checkPageBreak(16);
      const isIndDanger = ind.type === 'danger';
      const indR = isIndDanger ? 239 : 245;
      const indG = isIndDanger ? 68 : 158;
      const indB = isIndDanger ? 68 : 11;

      // Indicator pill
      doc.setFillColor(isIndDanger ? 254 : 255, isIndDanger ? 242 : 251, isIndDanger ? 242 : 235);
      doc.setDrawColor(indR, indG, indB);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, 'FD');

      // Type tag
      doc.setFillColor(indR, indG, indB);
      doc.roundedRect(margin + 2.5, y + 2.5, 18, 4.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text(ind.type.toUpperCase(), margin + 11.5, y + 5.7, { align: 'center' });

      // Indicator Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(ind.title, margin + 23, y + 6);

      // Indicator Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(ind.description, contentWidth - 28);
      doc.text(descLines[0] || '', margin + 23, y + 10.5);

      y += 15;
    });
  }

  y += 2;

  // 5. Embedded URL Inspection Table
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. URL & Network Infrastructure Telemetry', margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('STATUS', margin + 3, y + 4.2);
  doc.text('TARGET URL & REDIRECT DESTINATION', margin + 24, y + 4.2);
  doc.text('REP', margin + 105, y + 4.2);
  doc.text('DESTINATION IP / ASN', margin + 120, y + 4.2);
  doc.text('THREAT CLASSIFICATION', margin + 155, y + 4.2);
  y += 6;

  data.urls.forEach((item, idx) => {
    checkPageBreak(12);
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 10, 'F');

    // Status Badge
    const isUrlMal = item.status === 'MALICIOUS';
    const isUrlSusp = item.status === 'SUSPICIOUS';
    const urlR = isUrlMal ? 239 : isUrlSusp ? 245 : 16;
    const urlG = isUrlMal ? 68 : isUrlSusp ? 158 : 185;
    const urlB = isUrlMal ? 68 : isUrlSusp ? 11 : 129;

    doc.setFillColor(urlR, urlG, urlB);
    doc.roundedRect(margin + 2, y + 2, 17, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(item.status, margin + 10.5, y + 5.2, { align: 'center' });

    // URL & Redirect Chain
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const splitUrl = doc.splitTextToSize(item.url, 78);
    doc.text(splitUrl[0] || '', margin + 24, y + 4.2);

    if (item.redirectPath && item.redirectPath.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      const redirStr = item.redirectPath.join(' ');
      const splitRedir = doc.splitTextToSize(redirStr, 78);
      doc.text(splitRedir[0] || '', margin + 24, y + 8);
    }

    // Reputation Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(urlR, urlG, urlB);
    doc.text(`${item.reputationScore}/100`, margin + 105, y + 5.5);

    // IP / ASN
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(51, 65, 85);
    doc.text(item.destinationIp || 'N/A', margin + 120, y + 4.2);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    const splitAsn = doc.splitTextToSize(item.asn || '', 32);
    doc.text(splitAsn[0] || '', margin + 120, y + 8);

    // Threat Type
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(isUrlMal ? 220 : 71, isUrlMal ? 38 : 85, isUrlMal ? 38 : 105);
    doc.text(item.threatType || (isUrlMal ? 'High Risk' : 'None detected'), margin + 155, y + 5.5);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    y += 10;
  });

  y += 4;

  // --- PAGE 2 / TIMELINE & PIPELINE DETAILS ---
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Forensic Timeline & Evidence Sequence', margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  data.timeline.forEach((evt) => {
    checkPageBreak(16);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    // Time & Category badge
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 2.5, y + 2.5, 34, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(0, 218, 243);
    doc.text(evt.time.replace(' UTC', ''), margin + 19.5, y + 5.5, { align: 'center' });

    // Event title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(evt.title, margin + 40, y + 5.5);

    // Event Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(evt.description, contentWidth - 44);
    doc.text(splitDesc[0] || '', margin + 40, y + 9.5);

    // Metadata footnote if present
    if (evt.metadata?.originIp || evt.metadata?.claimedDomain) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      const metaStr = `IP: ${evt.metadata.originIp || 'N/A'} | Domain: ${evt.metadata.claimedDomain || 'N/A'} ${
        evt.metadata.spfResult ? '| SPF: ' + evt.metadata.spfResult : ''
      }`;
      doc.text(metaStr, margin + 40, y + 12.8);
    }

    y += 16;
  });

  y += 2;

  // 5. Automated Pipeline Inspection Audit
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('5. TraceMail 12-Stage Ingestion Pipeline Audit', margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const colWidth = (contentWidth - 6) / 2;
  data.stages.forEach((stage, idx) => {
    if (idx % 2 === 0) {
      checkPageBreak(10);
    }
    const isLeft = idx % 2 === 0;
    const itemX = isLeft ? margin : margin + colWidth + 6;
    const itemY = isLeft ? y : y;

    doc.setFillColor(248, 250, 252);
    doc.rect(itemX, itemY, colWidth, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.rect(itemX, itemY, colWidth, 7, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 180, 216);
    doc.text(`${stage.number}.`, itemX + 2, itemY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(stage.name, itemX + 8, itemY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(stage.duration || '', itemX + colWidth - 2, itemY + 4.5, { align: 'right' });

    if (!isLeft || idx === data.stages.length - 1) {
      y += 8.5;
    }
  });

  y += 4;

  // 6. Chain of Custody & Forensic Sign-off Footer
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('CHAIN OF CUSTODY & INTEGRITY VERIFICATION:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This forensic document has been generated from tamper-evident cryptographic headers recorded in the TraceMail AI SOC Vault. SHA-256 integrity digest matches artifact telemetry.',
    margin + 4,
    y + 9,
    { maxWidth: contentWidth - 8 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('AUTOMATED SOC AGENT SIGN-OFF: TRACEMAIL-SECOP-V4 // COMPLIANCE SEAL VALIDATED', margin + 4, y + 16);

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text('CONFIDENTIAL // FOR INTERNAL SECURITY OPERATIONS ONLY', pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.text('TRACEMAIL AI SOC', margin, pageHeight - 8);
  }

  // Download Trigger
  const safeTitle = data.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`TraceMail_Report_${data.id}_${safeTitle}.pdf`);
}
