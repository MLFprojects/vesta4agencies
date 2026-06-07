import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VestaReport, VestaInputState } from '../types';

/**
 * Common layout rendering engine for Vesta Real Estate PDF reports.
 * Employs a slicing technique to produce multi-page A4 PDFs with clean margins and no overlaps.
 */
const renderHtmlToA4Pdf = async (htmlContent: string, filename: string) => {
  // Create an offscreen DOM container
  const container = document.createElement('div');
  container.className = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#FAF6F0';
  container.innerHTML = htmlContent;
  
  document.body.appendChild(container);

  try {
    // Generate clean canvas representing the full off-screen document
    const canvas = await html2canvas(container, {
      scale: 2, // Retinal high resolution scaling
      useCORS: true,
      logging: false,
      backgroundColor: '#FAF6F0',
    });

    // Remove the offscreen container from DOM immediately
    document.body.removeChild(container);

    // Standard A4 dimensions in pixels matching a 800px-width layout:
    // Aspect ratio of A4 is 1 : 1.414. So height is 800 * 1.414 = 1131px approx.
    const pageHeightPx = Math.floor(canvas.width * 1.414);
    const totalHeight = canvas.height;
    
    // Allocate jsPDF in vertical portrait mode with standard A4 in millimeters
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let position = 0;
    while (position < totalHeight) {
      if (position > 0) {
        pdf.addPage();
      }

      // Slice canvas vertically into chunks matching a single page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(pageHeightPx, totalHeight - position);

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, position, canvas.width, pageCanvas.height, // Source frame
          0, 0, canvas.width, pageCanvas.height // Destination coordinate
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/png');
      const pagePrintHeight = (pageCanvas.height * pdfWidth) / canvas.width;

      pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pagePrintHeight);
      position += pageHeightPx;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Be sure to cleanup if container is still in body
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    throw error;
  }
};

/**
 * EXPORT CUSTOMER REPORT PDF
 * Centered on clean pricing, geographical insights, schematic outlines, and persuasive descriptions.
 */
export const exportClientReport = async (report: VestaReport, formState: VestaInputState) => {
  const estimatedMonthlyRent = Math.round((formState.price * 0.048) / 12);
  const roiPercentage = ((estimatedMonthlyRent * 12) / (formState.price || 1) * 100).toFixed(1);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #FAF6F0; color: #072814; line-height: 1.6;">
      
      <!-- HEADER BANNER -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0C4A26; padding-bottom: 24px; margin-bottom: 30px;">
        <div>
          <!-- Inline Crisp Vesta Logo -->
          <svg width="180" height="66" viewBox="0 0 310 115" fill="none" xmlns="http://www.w3.org/2050/svg">
            <circle cx="34" cy="18" r="11" fill="black" />
            <path d="M 12 35 L 34 105 L 56 35 L 43 35 L 34 85 L 25 35 Z" fill="black" />
            <path d="M 68 70 L 100 70 C 100 50 85 45 78 45 C 67 45 58 55 58 75 C 58 95 68 105 80 105 C 92 105 100 95 100 86 L 88 86 C 88 92 84 95 80 95 C 73 95 70 87 70 78 C 70 77 71 70 71 70 Z M 70 60 C 70 53 74 53 78 53 C 83 53 87 56 87 60 Z" fill="black" />
            <path d="M 106 94 C 112 104 121 105 125 105 C 132 105 138 101 138 94 C 138 88 132 85 122 83 C 112 80 106 75 106 64 C 106 53 115 45 126 45 C 136 45 144 52 148 62 L 137 68 C 133 60 128 55 125 55 C 120 55 117 58 117 63 C 117 68 122 70 130 73 C 141 76 149 81 149 93 C 149 105 139 115 124 115 C 113 115 106 108 102 98 Z" fill="black" />
            <path d="M 163 47 L 163 35 L 174 35 L 174 47 L 187 47 L 187 57 L 174 57 L 174 95 C 174 99 176 103 182 103 C 185 103 187 102 188 101 L 188 111 C 185 113 180 114 175 114 C 165 114 163 105 163 94 L 163 57 L 155 57 L 155 47 Z" fill="black" />
            <g transform="translate(196, 26)">
              <path d="M 40 0 L 0 35 L 0 86 L 80 86 L 80 35 Z" fill="#0C4A26" />
              <rect x="25" y="55" width="30" height="32" fill="white" />
              <g fill="white">
                <rect x="26" y="27" width="11" height="11" />
                <rect x="43" y="27" width="11" height="11" />
                <rect x="26" y="42" width="11" height="11" />
                <rect x="43" y="42" width="11" height="11" />
              </g>
            </g>
          </svg>
        </div>
        <div style="text-align: right;">
          <div style="font-family: monospace; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #0C4A26; margin-bottom: 4px;">REPORT DETTAGLIATO CLIENTE</div>
          <div style="font-size: 12px; color: #64748B;">Generato il ${formState.visitDate || new Date().toLocaleDateString('it-IT')}</div>
        </div>
      </div>

      <!-- TITLE -->
      <div style="margin-bottom: 30px;">
        <h1 style="font-size: 26px; font-weight: 800; color: #072814; margin: 0 0 8px 0; tracking: -0.02em;">Rapporto Immobiliare Personalizzato</h1>
        <p style="font-size: 13px; color: #475569; margin: 0;">
          Predisposto appositamente dal consulente <strong style="color: #0C4A26;">${formState.agentName || 'Vesta AI Partner'}</strong> per <span style="font-weight: 600; color: #072814;">${formState.clientName || 'Gentile Cliente'}</span>.
        </p>
      </div>

      <!-- PROPERTY TECH SUMMARY -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div>
          <span style="font-family: monospace; font-size: 9px; uppercase; letter-spacing: 1px; color: #94A3B8; display: block; font-weight: bold;">LOCALIZZAZIONE DELL'IMMOBILE</span>
          <span style="font-size: 15px; font-weight: bold; color: #072814; display: block; margin-top: 4px;">${formState.address || 'N/D'}</span>
          <span style="font-size: 13px; color: #475569; display: block; margin-top: 2px;">${formState.comune || 'N/D'} (${formState.cap || 'N/D'})</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-left: 1px solid #F5EFEB; padding-left: 20px; gap: 12px; text-align: center;">
          <div>
            <span style="font-family: monospace; font-size: 9px; font-weight: bold; color: #0C4A26;">PREZZO RICHIESTO</span>
            <span style="font-size: 16px; font-weight: 800; color: #072814; display: block; margin-top: 2px;">€${formState.price?.toLocaleString('it-IT') || 'N/D'}</span>
          </div>
          <div>
            <span style="font-family: monospace; font-size: 9px; font-weight: bold; color: #15803D;">SUPERFICIE TOTALE</span>
            <span style="font-size: 16px; font-weight: 850; color: #072814; display: block; margin-top: 2px;">${formState.sqm || 'N/D'} mq</span>
          </div>
          <div style="border-top: 1px solid #F5EFEB; padding-top: 8px;">
            <span style="font-family: monospace; font-size: 9px; color: #64748B;">NUMERO LOCALI</span>
            <span style="font-size: 13px; font-weight: 600; color: #072814; display: block; margin-top: 2px;">${formState.rooms || 'N/D'} Locali</span>
          </div>
          <div style="border-top: 1px solid #F5EFEB; padding-top: 8px;">
            <span style="font-family: monospace; font-size: 9px; color: #64748B;">CLASSE ENERGETICA</span>
            <span style="font-size: 13px; font-weight: 600; color: #072814; display: block; margin-top: 2px;">Classe ${formState.energyClass || 'N/D'}</span>
          </div>
        </div>
      </div>

      <!-- GEOGRAPHICAL ACCENTS -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #0C4A26; margin: 0 0 12px 0; border-bottom: 1px solid #F5EFEB; padding-bottom: 6px;">Studio di Analisi Territoriale</h3>
        <p style="font-size: 13px; color: #334155; margin: 0 0 16px 0; text-align: justify;">${report.geoAnalysis}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #F5EFEB; border-radius: 8px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0C4A26; margin-bottom: 4px;">🚌 TRASPORTI</div>
            <div style="font-size: 11.5px; color: #475569; line-height: 1.4;">${report.geoAnalysisDetails?.connections || 'N/D'}</div>
          </div>
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #F5EFEB; border-radius: 8px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #166534; margin-bottom: 4px;">🏫 SERVIZI</div>
            <div style="font-size: 11.5px; color: #475569; line-height: 1.4;">${report.geoAnalysisDetails?.services || 'N/D'}</div>
          </div>
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #F5EFEB; border-radius: 8px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #15803D; margin-bottom: 4px;">📈 TREND AREA</div>
            <div style="font-size: 11.5px; color: #475569; line-height: 1.4;">${report.geoAnalysisDetails?.marketTrend || 'N/D'}</div>
          </div>
        </div>
      </div>

      <!-- MARKETING COPIES -->
      <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 10px;">
        <!-- Schematic Profile -->
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.01);">
          <h3 style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0C4A26; border-bottom: 1px solid #F5EFEB; padding-bottom: 8px; margin: 0 0 12px 0; letter-spacing: 1px;">
            📋 PROPOSTA SCHEMATICA DELL'IMMOBILE
          </h3>
          <div style="font-size: 12.5px; color: #334155; white-space: pre-wrap; line-height: 1.7;">${report.marketingTexts['Proposta Schematica'] || report.marketingTexts['Schematica'] || 'N/D'}</div>
        </div>

        <!-- Descriptive/Emotional Profile -->
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.01);">
          <h3 style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0C4A26; border-bottom: 1px solid #F5EFEB; padding-bottom: 8px; margin: 0 0 12px 0; letter-spacing: 1px;">
            ✍️ DESCRIZIONE COMPLETA ED ESPOSITIVA
          </h3>
          <div style="font-size: 12.5px; color: #334155; white-space: pre-wrap; line-height: 1.7;">${report.marketingTexts['Proposta Descrittiva'] || report.marketingTexts['Descrittiva'] || 'N/D'}</div>
        </div>

        <!-- Dynamic Targets -->
        ${Object.entries(report.marketingTexts)
          .filter(([key]) => !['Proposta Schematica', 'Proposta Descrittiva', 'Schematica', 'Descrittiva'].includes(key))
          .map(([key, valor]) => `
            <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.01);">
              <h3 style="font-family: monospace; font-size: 11px; font-weight: bold; color: #166534; border-bottom: 1px solid #F5EFEB; padding-bottom: 8px; margin: 0 0 12px 0; letter-spacing: 1px;">
                ✨ ANALISI PARTICOLARE: ${key.toUpperCase()}
              </h3>
              <div style="font-size: 12.5px; color: #334155; white-space: pre-wrap; line-height: 1.7;">${valor}</div>
            </div>
          `).join('')}
      </div>

      <!-- FOOTER -->
      <div style="border-top: 1px solid #F5EFEB; padding-top: 20px; margin-top: 40px; text-align: center;">
        <p style="font-family: monospace; font-size: 9px; color: #94A3B8; margin: 0;">Rapporto redatto digitalmente tramite il sistema cognitivo Vesta AI v5.0.</p>
      </div>

    </div>
  `;

  await renderHtmlToA4Pdf(htmlContent, `Vesta-Report-${formState.clientName?.replace(/\s+/g, '_') || 'Cliente'}`);
};

/**
 * EXPORT INTERNAL AGENT WORK GUIDE PDF
 * Loaded with analytical objections counters, technical strengths mapping, and platform copywriting.
 */
export const exportAgentGuide = async (report: VestaReport, formState: VestaInputState) => {
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #FAF6F0; color: #072814; line-height: 1.6;">
      
      <!-- HEADER BANNER -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0C4A26; padding-bottom: 24px; margin-bottom: 30px;">
        <div>
          <!-- Inline Crisp Vesta Logo -->
          <svg width="180" height="66" viewBox="0 0 310 115" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="34" cy="18" r="11" fill="black" />
            <path d="M 12 35 L 34 105 L 56 35 L 43 35 L 34 85 L 25 35 Z" fill="black" />
            <path d="M 68 70 L 100 70 C 100 50 85 45 78 45 C 67 45 58 55 58 75 C 58 95 68 105 80 105 C 92 105 100 95 100 86 L 88 86 C 88 92 84 95 80 95 C 73 95 70 87 70 78 C 70 77 71 70 71 70 Z M 70 60 C 70 53 74 53 78 53 C 83 53 87 56 87 60 Z" fill="black" />
            <path d="M 106 94 C 112 104 121 105 125 105 C 132 105 138 101 138 94 C 138 88 132 85 122 83 C 112 80 106 75 106 64 C 106 53 115 45 126 45 C 136 45 144 52 148 62 L 137 68 C 133 60 128 55 125 55 C 120 55 117 58 117 63 C 117 68 122 70 130 73 C 141 76 149 81 149 93 C 149 105 139 115 124 115 C 113 115 106 108 102 98 Z" fill="black" />
            <path d="M 163 47 L 163 35 L 174 35 L 174 47 L 187 47 L 187 57 L 174 57 L 174 95 C 174 99 176 103 182 103 C 185 103 187 102 188 101 L 188 111 C 185 113 180 114 175 114 C 165 114 163 105 163 94 L 163 57 L 155 57 L 155 47 Z" fill="black" />
            <g transform="translate(196, 26)">
              <path d="M 40 0 L 0 35 L 0 86 L 80 86 L 80 35 Z" fill="#0C4A26" />
              <rect x="25" y="55" width="30" height="32" fill="white" />
              <g fill="white">
                <rect x="26" y="27" width="11" height="11" />
                <rect x="43" y="27" width="11" height="11" />
                <rect x="26" y="42" width="11" height="11" />
                <rect x="43" y="42" width="11" height="11" />
              </g>
            </g>
          </svg>
        </div>
        <div style="text-align: right;">
          <div style="font-family: monospace; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #0C4A26; margin-bottom: 4px;">GUIDA DI VENDITA INTERNA</div>
          <div style="font-size: 12px; color: #64748B;">Generato il ${formState.visitDate || new Date().toLocaleDateString('it-IT')}</div>
        </div>
      </div>

      <!-- TITLE -->
      <div style="margin-bottom: 30px;">
        <h1 style="font-size: 26px; font-weight: 800; color: #072814; margin: 0 0 8px 0; tracking: -0.02em;">Guida dell'Agente & Dialettica Strategica</h1>
        <p style="font-size: 13px; color: #475569; margin: 0;">
          Metodologia di vendita per l'asset in <span style="font-weight: 600; color: #072814;">${formState.address || 'N/D'}</span> | Agente Incaricato: <strong style="color: #0C4A26;">${formState.agentName || 'Vesta AI Partner'}</strong>.
        </p>
      </div>

      <!-- PROPERTY ASSET STRENGTHS -->
      <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px; margin-bottom: 24px;">
        <h3 style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0C4A26; border-bottom: 1px solid #F5EFEB; padding-bottom: 8px; margin: 0 0 16px 0; letter-spacing: 1px;">
          ✓ PUNTI DI FORZA CHIAVE DA COMUNICARE AL CLIENTE
        </h3>
        <ul style="padding-left: 0; margin: 0; list-style-type: none;">
          ${report.visitGuide.strengths.map((str) => `
            <li style="font-size: 12.5px; color: #334155; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
              <span style="color: #064E3B; font-weight: bold;">✔</span>
              <span>${str}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- OBJECTION RESOLUTION DIALECTIC TABLE -->
      <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px; margin-bottom: 30px;">
        <h3 style="font-family: monospace; font-size: 11px; font-weight: bold; color: #B45309; border-bottom: 1px solid #F5EFEB; padding-bottom: 8px; margin: 0 0 16px 0; letter-spacing: 1px;">
          🛡️ GUIDA AL SUPERAMENTO DELLE OBIEZIONI COGNITIVE
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #F5EFEB; text-transform: uppercase;">
              <th style="padding: 10px 12px; color: #072814; font-weight: bold; width: 40%;">[⚠️ OBIEZIONE POTENZIALE]</th>
              <th style="padding: 10px 12px; color: #0C4A26; font-weight: bold; width: 60%; border-left: 1px solid #F5EFEB;">[🛡️ ARGOMENTAZIONE STRATEGICA]</th>
            </tr>
          </thead>
          <tbody>
            ${report.visitGuide.objections.map((ob) => `
              <tr style="border-bottom: 1px solid #F5EFEB;">
                <td style="padding: 12px; color: #072814; font-weight: 600; vertical-align: top;">${ob.text}</td>
                <td style="padding: 12px; color: #334155; border-left: 1px solid #F5EFEB; vertical-align: top; line-height: 1.6;">${ob.answer}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- COPYWRITING PORTAL INJECTIONS -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px;">
          <h4 style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0C4A26; margin: 0 0 10px 0; letter-spacing: 1px;">
            📄 ANNUNCIO IMMOBILIARE.IT
          </h4>
          <pre style="font-size: 11px; font-family: monospace; padding: 16px; background-color: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 6px; white-space: pre-wrap; margin: 0; line-height: 1.6; color: #334155;">${report.portalTexts.immobiliareIt}</pre>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px;">
          <h4 style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0C4A26; margin: 0 0 10px 0; letter-spacing: 1px;">
            📄 ANNUNCIO IDEALISTA.IT
          </h4>
          <pre style="font-size: 11px; font-family: monospace; padding: 16px; background-color: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 6px; white-space: pre-wrap; margin: 0; line-height: 1.6; color: #334155;">${report.portalTexts.idealista}</pre>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px;">
          <h4 style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0C4A26; margin: 0 0 10px 0; letter-spacing: 1px;">
            📱 POST MARKETING FACEBOOK (Con Emoji)
          </h4>
          <div style="font-size: 12px; color: #334155; padding: 16px; background-color: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 6px; white-space: pre-line; line-height: 1.6;">${report.portalTexts.facebook}</div>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border: 1px solid #F5EFEB; border-radius: 12px;">
          <h4 style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0C4A26; margin: 0 0 10px 0; letter-spacing: 1px;">
            📸 POST INSTAGRAM (Sezione Hashtags)
          </h4>
          <div style="font-size: 12px; color: #334155; padding: 16px; background-color: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 6px; white-space: pre-line; line-height: 1.6;">${report.portalTexts.instagram}</div>
        </div>

      </div>

      <!-- FOOTER -->
      <div style="border-top: 1px solid #F5EFEB; padding-top: 20px; margin-top: 40px; text-align: center;">
        <p style="font-family: monospace; font-size: 9px; color: #94A3B8; margin: 0;">GUIDA RISERVATA AD USO INTERNO DELL'AGENZIA PARTNER VESTA. VIETATA LA DIFFUSIONE.</p>
      </div>

    </div>
  `;

  await renderHtmlToA4Pdf(htmlContent, `Vesta-Guida-Agente-${formState.address?.substring(0, 15).replace(/\s+/g, '_') || 'Interna'}`);
};
