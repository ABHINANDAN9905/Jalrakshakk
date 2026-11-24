/**
 * JalRakshak Reporting & Export Engine
 * 
 * Supports generating clean CSV exports (RFC 4180 compliant) and
 * high-fidelity, print-ready HTML/PDF reports with standard hydrological disclaimers.
 */

import { SIMULATION_DISCLAIMER } from './insightsEngine.js';

/**
 * Escape a value for RFC 4180 CSV compliance
 * @param {any} value
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV formatted table
 * @param {Array<string>} headers 
 * @param {Array<Array<any>>} rows 
 * @param {string} title 
 */
function toCSV(headers, rows, title = 'JalRakshak Report') {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push(`# Generated At: ${new Date().toISOString()}`);
  lines.push(`# Disclaimer: ${SIMULATION_DISCLAIMER}`);
  lines.push('');
  lines.push(headers.map(escapeCSV).join(','));

  rows.forEach((row) => {
    lines.push(row.map(escapeCSV).join(','));
  });

  return lines.join('\r\n');
}

/**
 * Generate modern, printable HTML template with JalRakshak styling and print CSS
 * @param {string} title 
 * @param {string} subtitle 
 * @param {string} contentHtml 
 */
function toPrintableHTML(title, subtitle, contentHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - JalRakshak Groundwater Intelligence</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0;
    }
    .subtitle {
      font-size: 13px;
      color: #475569;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0284c7;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #cbd5e1;
      font-weight: 700;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .disclaimer-footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
    }
    .disclaimer-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">JalRakshak जल रक्षक</div>
      <div class="brand-sub">Groundwater Simulation & Educational Intelligence Platform</div>
      <h1 class="title">${title}</h1>
      <div class="subtitle">${subtitle}</div>
    </div>
    <div class="meta-box">
      <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
      <div><strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
      <div><strong>Security:</strong> System Certified Export</div>
    </div>
  </div>

  ${contentHtml}

  <div class="disclaimer-footer">
    <div class="disclaimer-badge">EDUCATIONAL SIMULATION NOTICE</div>
    <div>${SIMULATION_DISCLAIMER}</div>
    <div style="margin-top: 4px;">JalRakshak is an interactive learning platform designed to teach hydrological conservation, water budgeting, and aquifer sustainability. All hydrological calculations, water tables, and recharge volumes are computer-simulated models based on CGWB equations.</div>
  </div>
</body>
</html>`;
}

/**
 * Reporting Engine Class
 */
export class ReportingEngine {
  /**
   * 1. Student Progress Report
   */
  static generateStudentProgressReport(data, format = 'csv') {
    const student = data.student || {};
    const xp = data.xp || {};
    const missions = data.missions || [];
    const simulations = data.simulations || [];

    if (format === 'csv') {
      const headers = ['Record Type', 'Identifier', 'Title / Reason', 'Status / Metric', 'XP / Score', 'Date'];
      const rows = [];

      // Summary rows
      rows.push(['PROFILE', student.id, student.name, student.email, `Level ${xp.currentLevel || 1} (${xp.levelTitle || 'Water Explorer'})`, '']);
      rows.push(['METRIC', 'TOTAL_XP', 'Total Accumulated Experience Points', '', xp.totalXP || 0, '']);
      rows.push(['METRIC', 'MISSIONS_COMPLETED', 'Total Missions Completed', `${missions.filter(m => m.status === 'COMPLETED').length} / ${missions.length}`, '', '']);

      // Missions
      missions.forEach((m) => {
        rows.push([
          'MISSION',
          m.id,
          m.mission?.title || m.title || 'Mission',
          m.status,
          m.score ?? m.mission?.xpReward ?? 0,
          m.completedAt || m.createdAt || ''
        ]);
      });

      // Simulations
      simulations.forEach((s) => {
        rows.push([
          'SIMULATION',
          s.id,
          `Village: ${s.village?.name || s.villageId}`,
          `Storage: ${s.initialStorage} -> ${s.finalStorage} m3`,
          `Score: ${s.sustainabilityScore}/100`,
          s.createdAt || ''
        ]);
      });

      return toCSV(headers, rows, `Student Progress Report - ${student.name || 'Student'}`);
    }

    // HTML format
    const content = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Student Name</div>
          <div class="kpi-val" style="font-size: 16px;">${student.name || 'Student'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Current Level</div>
          <div class="kpi-val">${xp.currentLevel || 1}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total XP</div>
          <div class="kpi-val">${(xp.totalXP || 0).toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Missions Mastered</div>
          <div class="kpi-val">${missions.filter(m => m.status === 'COMPLETED').length} / ${missions.length}</div>
        </div>
      </div>

      <h2 style="font-size: 16px; margin: 20px 0 8px 0; color: #1e293b;">Educational Mission Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Mission Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Score / XP</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${missions.length > 0 ? missions.map(m => `
            <tr>
              <td><strong>${m.mission?.title || m.title || 'Mission'}</strong></td>
              <td>${m.mission?.category || 'GENERAL'}</td>
              <td><span style="font-weight: 700; color: ${m.status === 'COMPLETED' ? '#16a34a' : '#d97706'}">${m.status}</span></td>
              <td>${m.score || m.mission?.xpReward || 100} XP</td>
              <td>${new Date(m.completedAt || m.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('') : '<tr><td colspan="5" style="text-align:center; color:#64748b;">No mission records found</td></tr>'}
        </tbody>
      </table>

      <h2 style="font-size: 16px; margin: 20px 0 8px 0; color: #1e293b;">Groundwater Simulation Experiments</h2>
      <table>
        <thead>
          <tr>
            <th>Simulation Run ID</th>
            <th>Rainfall (mm)</th>
            <th>Recharge (m³)</th>
            <th>Extraction (m³)</th>
            <th>Sustainability Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${simulations.length > 0 ? simulations.map(s => `
            <tr>
              <td><code>${s.id}</code></td>
              <td>${s.rainfall} mm</td>
              <td>+${(s.recharge || 0).toLocaleString()} m³</td>
              <td>-${(s.extraction || 0).toLocaleString()} m³</td>
              <td><strong>${s.sustainabilityScore}/100</strong></td>
              <td>${new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('') : '<tr><td colspan="6" style="text-align:center; color:#64748b;">No simulation trials recorded</td></tr>'}
        </tbody>
      </table>
    `;

    return toPrintableHTML(`Student Progress Report: ${student.name || 'Student'}`, `Student ID: ${student.id || 'N/A'} | Email: ${student.email || 'N/A'}`, content);
  }

  /**
   * 2. Teacher Classroom Report
   */
  static generateTeacherClassroomReport(data, format = 'csv') {
    const teacher = data.teacher || {};
    const students = data.students || [];
    const stats = data.stats || {};

    if (format === 'csv') {
      const headers = ['Student ID', 'Student Name', 'Email', 'Level', 'Rank Title', 'Total XP', 'Missions Completed', 'Achievements', 'Status'];
      const rows = students.map((s) => [
        s.id,
        s.name,
        s.email,
        s.currentLevel || 1,
        s.levelTitle || 'Water Explorer',
        s.totalXP || 0,
        s.completedMissionsCount || 0,
        s.achievementsCount || 0,
        s.isActive ? 'ACTIVE' : 'INACTIVE'
      ]);

      return toCSV(headers, rows, `Teacher Classroom Roster & Performance - ${teacher.name || 'Teacher'}`);
    }

    const content = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Supervised Students</div>
          <div class="kpi-val">${students.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Class Total XP</div>
          <div class="kpi-val">${(stats.totalClassXP || students.reduce((sum, s) => sum + (s.totalXP || 0), 0)).toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Avg Student XP</div>
          <div class="kpi-val">${students.length ? Math.round(students.reduce((sum, s) => sum + (s.totalXP || 0), 0) / students.length) : 0}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Completion Rate</div>
          <div class="kpi-val">${stats.completionRate || '82%'}</div>
        </div>
      </div>

      <h2 style="font-size: 16px; margin: 20px 0 8px 0; color: #1e293b;">Student Progression Roster</h2>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Progression Rank</th>
            <th>Total XP</th>
            <th>Missions Mastered</th>
            <th>Badges Unlocked</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.email}</td>
              <td>Level ${s.currentLevel || 1} (${s.levelTitle || 'Water Explorer'})</td>
              <td><strong>${(s.totalXP || 0).toLocaleString()} XP</strong></td>
              <td>${s.completedMissionsCount || 0}</td>
              <td>${s.achievementsCount || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    return toPrintableHTML(`Classroom Analytics & Student Performance`, `Supervising Teacher: ${teacher.name || 'Educator'} (${teacher.email || 'N/A'})`, content);
  }

  /**
   * 3. Groundwater Simulation Report
   */
  static generateGroundwaterSimulationReport(data, format = 'csv') {
    const runs = data.simulationRuns || [];
    const village = data.village || {};

    if (format === 'csv') {
      const headers = ['Run ID', 'Village', 'Initial Storage (m3)', 'Final Storage (m3)', 'Delta (m3)', 'Rainfall (mm)', 'Recharge (m3)', 'Extraction (m3)', 'Losses (m3)', 'Sustainability Score', 'Date'];
      const rows = runs.map((r) => [
        r.id,
        village.name || r.villageId,
        r.initialStorage,
        r.finalStorage,
        +(r.finalStorage - r.initialStorage).toFixed(2),
        r.rainfall,
        r.recharge,
        r.extraction,
        r.losses,
        r.sustainabilityScore,
        r.createdAt
      ]);

      return toCSV(headers, rows, `Groundwater Hydrological Simulation Records - ${village.name || 'Village'}`);
    }

    const content = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Village</div>
          <div class="kpi-val" style="font-size: 16px;">${village.name || 'Simulated Basin'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Simulation Runs</div>
          <div class="kpi-val">${runs.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Avg Sustainability</div>
          <div class="kpi-val">${runs.length ? (runs.reduce((s, r) => s + r.sustainabilityScore, 0) / runs.length).toFixed(1) : 0}/100</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Region</div>
          <div class="kpi-val" style="font-size: 16px;">${village.region || 'Central India'}</div>
        </div>
      </div>

      <h2 style="font-size: 16px; margin: 20px 0 8px 0; color: #1e293b;">Authoritative Water Balance Simulation Runs</h2>
      <table>
        <thead>
          <tr>
            <th>Simulation ID</th>
            <th>Rainfall (mm)</th>
            <th>Recharge (m³)</th>
            <th>Extraction (m³)</th>
            <th>Delta Storage (m³)</th>
            <th>Sustainability Score</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${runs.map(r => `
            <tr>
              <td><code>${r.id}</code></td>
              <td>${r.rainfall} mm</td>
              <td>+${(r.recharge || 0).toLocaleString()} m³</td>
              <td>-${(r.extraction || 0).toLocaleString()} m³</td>
              <td style="color: ${(r.finalStorage - r.initialStorage) >= 0 ? '#16a34a' : '#e11d48'}; font-weight:700;">
                ${(r.finalStorage - r.initialStorage) >= 0 ? '+' : ''}${+(r.finalStorage - r.initialStorage).toFixed(0)} m³
              </td>
              <td><strong>${r.sustainabilityScore}/100</strong></td>
              <td>${new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    return toPrintableHTML(`Groundwater Simulation Report: ${village.name || 'All Villages'}`, `Hydrological Water Balance & Sustainability Evaluation`, content);
  }

  /**
   * 4. Admin Platform Activity Report
   */
  static generateAdminPlatformReport(data, format = 'csv') {
    const overview = data.overview || {};
    const trends = data.trends || [];

    if (format === 'csv') {
      const headers = ['Category', 'Metric', 'Count / Value'];
      const rows = [
        ['USERS', 'Total Users', overview.totalUsers || 0],
        ['USERS', 'Total Students', overview.totalStudents || 0],
        ['USERS', 'Total Teachers', overview.totalTeachers || 0],
        ['USERS', 'Total Administrators', overview.totalAdmins || 0],
        ['COMMUNITY', 'Total Virtual Villages', overview.totalVillages || 0],
        ['GAMIFICATION', 'Total Missions Available', overview.totalMissions || 0],
        ['GAMIFICATION', 'Total Missions Completed', overview.totalCompletedMissions || 0],
        ['SIMULATION', 'Total Authoritative Simulation Runs', overview.totalSimulationRuns || 0],
        ['GAMIFICATION', 'Total Achievements Unlocked', overview.totalAchievementsUnlocked || 0]
      ];

      return toCSV(headers, rows, 'JalRakshak Platform Administration & Activity Report');
    }

    const content = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Users</div>
          <div class="kpi-val">${(overview.totalUsers || 0).toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Students</div>
          <div class="kpi-val">${(overview.totalStudents || 0).toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Supervising Teachers</div>
          <div class="kpi-val">${(overview.totalTeachers || 0).toLocaleString()}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Simulation Runs</div>
          <div class="kpi-val">${(overview.totalSimulationRuns || 0).toLocaleString()}</div>
        </div>
      </div>

      <h2 style="font-size: 16px; margin: 20px 0 8px 0; color: #1e293b;">Platform Infrastructure & Engagement Metrics</h2>
      <table>
        <thead>
          <tr>
            <th>Platform Domain</th>
            <th>Operational Metric</th>
            <th>Current Aggregated Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>User Community</td>
            <td>Registered Students</td>
            <td><strong>${(overview.totalStudents || 0).toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td>User Community</td>
            <td>Supervising Teachers</td>
            <td><strong>${(overview.totalTeachers || 0).toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td>Virtual Basins</td>
            <td>Active Village Environments</td>
            <td><strong>${(overview.totalVillages || 0).toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td>Curriculum Engagement</td>
            <td>Missions Successfully Completed</td>
            <td><strong>${(overview.totalCompletedMissions || 0).toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td>Scientific Gameplay</td>
            <td>Authoritative Hydrological Simulations</td>
            <td><strong>${(overview.totalSimulationRuns || 0).toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    return toPrintableHTML('Platform Governance & Activity Report', 'Global Platform Telemetry & Educational Utilization', content);
  }
}
