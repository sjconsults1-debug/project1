import puppeteer from 'puppeteer';
import { Resume, Template } from '@prisma/client';
import { ResumeContent, ExportFormat } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';

export class PDFService {
  private generateHTML(resumeContent: ResumeContent, template: Template): string {
    const templateData = template.templateData as any;
    const { colors, fonts, layout } = templateData;

    const personalInfo = resumeContent.personalInfo;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${personalInfo.firstName} ${personalInfo.lastName} - Resume</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=${fonts.heading.replace(' ', '+')}&family=${fonts.body.replace(' ', '+')}&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: '${fonts.body}', sans-serif;
                font-size: ${fonts.sizes.body}px;
                line-height: 1.6;
                color: ${colors.text};
                background: ${colors.background};
            }

            .container {
                max-width: 8.5in;
                margin: 0 auto;
                padding: 0.5in;
                background: white;
                min-height: 11in;
            }

            .header {
                background: ${colors.primary};
                color: white;
                padding: ${layout.headerHeight}px 40px;
                margin-bottom: ${layout.sectionSpacing}px;
                border-radius: 8px;
            }

            .header h1 {
                font-family: '${fonts.heading}', sans-serif;
                font-size: ${fonts.sizes.h1}px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .contact-info {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                font-size: ${fonts.sizes.small}px;
            }

            .contact-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .section {
                margin-bottom: ${layout.sectionSpacing}px;
            }

            .section-title {
                font-family: '${fonts.heading}', sans-serif;
                font-size: ${fonts.sizes.h2}px;
                font-weight: 600;
                color: ${colors.primary};
                margin-bottom: 16px;
                border-bottom: 2px solid ${colors.primary};
                padding-bottom: 8px;
            }

            .summary-text {
                font-size: ${fonts.sizes.body}px;
                line-height: 1.7;
                margin-bottom: 16px;
            }

            .experience-item, .education-item, .project-item {
                margin-bottom: 20px;
                padding-left: 20px;
                border-left: 3px solid ${colors.accent};
            }

            .item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .item-title {
                font-family: '${fonts.heading}', sans-serif;
                font-size: ${fonts.sizes.h3}px;
                font-weight: 600;
                color: ${colors.primary};
            }

            .item-subtitle {
                font-weight: 500;
                color: ${colors.secondary};
            }

            .item-date {
                font-size: ${fonts.sizes.small}px;
                color: ${colors.secondary};
                white-space: nowrap;
            }

            .item-description {
                margin-top: 8px;
                line-height: 1.6;
            }

            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .skill-category {
                margin-bottom: 12px;
            }

            .skill-category-title {
                font-weight: 600;
                color: ${colors.primary};
                margin-bottom: 6px;
                font-size: ${fonts.sizes.h3}px;
            }

            .skill-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #eee;
            }

            .skill-level {
                font-size: ${fonts.sizes.small}px;
                color: ${colors.secondary};
                text-transform: capitalize;
            }

            .achievements {
                margin-top: 8px;
            }

            .achievement {
                position: relative;
                padding-left: 20px;
                margin-bottom: 4px;
            }

            .achievement:before {
                content: "•";
                position: absolute;
                left: 0;
                color: ${colors.accent};
                font-weight: bold;
            }

            .two-column {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
            }

            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }

                .container {
                    padding: 0;
                    box-shadow: none;
                }

                .no-print {
                    display: none !important;
                }
            }

            @page {
                margin: 0.5in;
                size: letter;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header Section -->
            <div class="header">
                <h1>${personalInfo.firstName} ${personalInfo.lastName}</h1>
                <div class="contact-info">
                    ${personalInfo.email ? `<div class="contact-item">📧 ${personalInfo.email}</div>` : ''}
                    ${personalInfo.phone ? `<div class="contact-item">📱 ${personalInfo.phone}</div>` : ''}
                    ${personalInfo.location ? `<div class="contact-item">📍 ${personalInfo.location}</div>` : ''}
                    ${personalInfo.website ? `<div class="contact-item">🌐 ${personalInfo.website}</div>` : ''}
                    ${personalInfo.linkedin ? `<div class="contact-item">💼 LinkedIn</div>` : ''}
                    ${personalInfo.github ? `<div class="contact-item">💻 GitHub</div>` : ''}
                </div>
            </div>

            ${layout.columnLayout === 'two-column' ? '<div class="two-column">' : ''}

            <!-- Summary Section -->
            ${resumeContent.summary ? `
            <div class="section">
                <h2 class="section-title">Professional Summary</h2>
                <p class="summary-text">${resumeContent.summary}</p>
            </div>
            ` : ''}

            <!-- Experience Section -->
            ${resumeContent.experience && resumeContent.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Professional Experience</h2>
                ${resumeContent.experience.map(exp => `
                <div class="experience-item">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${exp.position || 'Position'}</div>
                            <div class="item-subtitle">${exp.company || 'Company'}</div>
                            ${exp.location ? `<div class="item-subtitle">${exp.location}</div>` : ''}
                        </div>
                        <div class="item-date">
                            ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}
                        </div>
                    </div>
                    ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                    ${exp.achievements && exp.achievements.length > 0 ? `
                    <div class="achievements">
                        ${exp.achievements.map(achievement =>
                            achievement ? `<div class="achievement">${achievement}</div>` : ''
                        ).join('')}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Education Section -->
            ${resumeContent.education && resumeContent.education.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Education</h2>
                ${resumeContent.education.map(edu => `
                <div class="education-item">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${edu.degree || 'Degree'} in ${edu.field || 'Field of Study'}</div>
                            <div class="item-subtitle">${edu.institution || 'Institution'}</div>
                        </div>
                        <div class="item-date">
                            ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate || 'Present'}
                        </div>
                    </div>
                    ${edu.gpa ? `<div class="item-subtitle">GPA: ${edu.gpa}</div>` : ''}
                    ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Skills Section -->
            ${resumeContent.skills && resumeContent.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Skills</h2>
                <div class="skills-grid">
                    ${this.groupSkillsByCategory(resumeContent.skills).map(category => `
                    <div class="skill-category">
                        <div class="skill-category-title">${category.name}</div>
                        ${category.skills.map(skill => `
                        <div class="skill-item">
                            <span>${skill.name}</span>
                            <span class="skill-level">${skill.level}</span>
                        </div>
                        `).join('')}
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Projects Section -->
            ${resumeContent.projects && resumeContent.projects.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Projects</h2>
                ${resumeContent.projects.map(project => `
                <div class="project-item">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${project.name || 'Project Name'}</div>
                            <div class="item-subtitle">${project.technologies ? project.technologies.join(', ') : ''}</div>
                        </div>
                        <div class="item-date">
                            ${project.startDate} - ${project.current ? 'Present' : project.endDate || 'Present'}
                        </div>
                    </div>
                    ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
                    ${project.url || project.github ? `
                    <div class="item-subtitle" style="margin-top: 8px;">
                        ${project.url ? `🌐 ${project.url}` : ''}
                        ${project.github ? `${project.url ? ' | ' : ''}💻 ${project.github}` : ''}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Certifications Section -->
            ${resumeContent.certifications && resumeContent.certifications.length > 0 ? `
            <div class="section">
                <h2 class="section-title">Certifications</h2>
                ${resumeContent.certifications.map(cert => `
                <div class="experience-item">
                    <div class="item-header">
                        <div>
                            <div class="item-title">${cert.name || 'Certification Name'}</div>
                            <div class="item-subtitle">${cert.issuer || 'Issuing Organization'}</div>
                        </div>
                        <div class="item-date">
                            ${cert.issueDate} ${cert.expiryDate ? `- ${cert.expiryDate}` : ''}
                        </div>
                    </div>
                    ${cert.credentialId ? `<div class="item-subtitle">Credential ID: ${cert.credentialId}</div>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            ${layout.columnLayout === 'two-column' ? '</div>' : ''}

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                Generated on ${new Date().toLocaleDateString()} • AI Resume Builder Pro
            </div>
        </div>
    </body>
    </html>`;
  }

  private groupSkillsByCategory(skills: any[]): { name: string; skills: any[] }[] {
    const grouped: { [key: string]: any[] } = {};

    skills.forEach(skill => {
      const category = skill.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });

    return Object.entries(grouped).map(([name, skills]) => ({ name, skills }));
  }

  async generatePDF(
    resumeContent: ResumeContent,
    template: Template,
    options: {
      watermark?: boolean;
      fileName?: string;
    } = {}
  ): Promise<{ buffer: Buffer; fileName: string }> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();

      // Set viewport to standard letter size
      await page.setViewport({ width: 794, height: 1123 });

      const html = this.generateHTML(resumeContent, template);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Add watermark if requested
      if (options.watermark) {
        await page.addStyleTag({
          content: `
            .container::before {
              content: "AI Resume Builder Pro - Free Version";
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 48px;
              color: rgba(0, 0, 0, 0.1);
              z-index: -1;
              pointer-events: none;
            }
          `
        });
      }

      const fileName = options.fileName ||
        `${resumeContent.personalInfo.firstName}_${resumeContent.personalInfo.lastName}_Resume_${Date.now()}.pdf`;

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        preferCSSPageSize: true
      });

      await page.close();

      return {
        buffer: pdfBuffer,
        fileName
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async generateDOCX(resumeContent: ResumeContent): Promise<{ buffer: Buffer; fileName: string }> {
    // For now, return a simple text-based document
    // In a production environment, you would use a library like docx
    const personalInfo = resumeContent.personalInfo;

    let docContent = `${personalInfo.firstName} ${personalInfo.lastName}\n`;
    docContent += `${personalInfo.email}\n`;
    docContent += `${personalInfo.phone}\n`;
    docContent += `${personalInfo.location}\n\n`;

    if (resumeContent.summary) {
      docContent += `PROFESSIONAL SUMMARY\n${'='.repeat(50)}\n${resumeContent.summary}\n\n`;
    }

    if (resumeContent.experience && resumeContent.experience.length > 0) {
      docContent += `PROFESSIONAL EXPERIENCE\n${'='.repeat(50)}\n`;
      resumeContent.experience.forEach(exp => {
        docContent += `${exp.position} - ${exp.company}\n`;
        docContent += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
        if (exp.description) docContent += `${exp.description}\n`;
        docContent += '\n';
      });
    }

    const fileName = `${personalInfo.firstName}_${personalInfo.lastName}_Resume_${Date.now()}.txt`;
    const buffer = Buffer.from(docContent, 'utf8');

    return { buffer, fileName };
  }

  async savePDFFile(buffer: Buffer, fileName: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads');

    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    return filePath;
  }
}

export const pdfService = new PDFService();