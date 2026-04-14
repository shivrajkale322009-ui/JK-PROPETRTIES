"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const ReportsPage = () => {
  const sourceData = [
    { name: 'Facebook', value: 400 },
    { name: 'WhatsApp', value: 300 },
    { name: 'Website', value: 200 },
    { name: 'Referral', value: 100 },
  ];

  const conversionData = [
    { name: 'Jan', leads: 400, closed: 24 },
    { name: 'Feb', leads: 300, closed: 18 },
    { name: 'Mar', leads: 500, closed: 45 },
    { name: 'Apr', leads: 280, closed: 32 },
  ];

  const COLORS = ['#2d1b10', '#c5a059', '#5d4037', '#10b981'];

  return (
    <div className="container animate-fade">
      <header className="page-header">
        <h1>Performance Reports</h1>
        <button className="btn-secondary">
          <Download size={18} />
          Export Data
        </button>
      </header>

      <div className="reports-grid">
        <section className="card chart-card">
          <h3>Lead Source Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {sourceData.map((d, i) => (
              <div key={i} className="legend-item">
                <span className="dot" style={{ background: COLORS[i] }}></span>
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card chart-card">
          <h3>Monthly Conversions</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#2d1b10" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" fill="#c5a059" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

    </div>
  );
};

export default ReportsPage;
