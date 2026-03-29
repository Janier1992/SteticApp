
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { InsforgeService } from '../services/insforgeService';

interface ReportsProps {
  appointments: Appointment[];
  businessId?: string;
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMADA: 'Confirmada',
  PENDIENTE: 'Pendiente',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
};

const Reports: React.FC<ReportsProps> = ({ appointments, businessId }) => {
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
  const [expenses, setExpenses] = useState<{ total: number }>({ total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let bizId = businessId;
        if (!bizId) {
          const biz = await InsforgeService.getBusinesses();
          bizId = biz?.[0]?.id;
        }
        if (!bizId) return;
        const staff = await InsforgeService.getStaff(bizId);
        const map: Record<string, string> = {};
        staff?.forEach((s: any) => { map[s.id] = s.name; });
        setStaffMap(map);
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const expData = await InsforgeService.getExpenses(bizId, month);
        setExpenses({ total: expData?.reduce((acc: number, e: any) => acc + e.amount, 0) ?? 0 });
      } catch { /* ignore */ }
    };
    fetchData();
  }, [businessId]);

  const totalCitas = appointments.length;
  const confirmadas = appointments.filter(a => a.status === AppointmentStatus.CONFIRMED || a.status === 'CONFIRMADA').length;
  const pendientes = appointments.filter(a => a.status === AppointmentStatus.PENDING || a.status === 'PENDIENTE').length;
  const canceladas = appointments.filter(a => a.status === AppointmentStatus.CANCELLED || a.status === 'CANCELADA').length;
  const tasaConf = totalCitas > 0 ? Math.round((confirmadas / totalCitas) * 100) : 100;
  const ingresosEst = confirmadas * 45000;

  const handleExportCSV = () => {
    const headers = ['Cliente', 'Correo', 'Servicio', 'Profesional', 'Fecha Inicio', 'Estado'];
    const rows = appointments.map(a => [a.clientName, a.clientEmail || '-', a.serviceName, staffMap[a.staffId] || a.staffId, new Date(a.startTime).toLocaleString('es-CO'), STATUS_LABEL[a.status] || a.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `informe_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const card: React.CSSProperties = { background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' };

  const kpis = [
    { label: 'Total Citas', value: totalCitas, icon: 'calendar_month', color: 'var(--color-text)' },
    { label: 'Confirmadas', value: confirmadas, icon: 'check_circle', color: '#16a34a' },
    { label: 'Pendientes', value: pendientes, icon: 'pending', color: '#d97706' },
    { label: 'Canceladas', value: canceladas, icon: 'cancel', color: '#dc2626' },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-32" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto p-6 lg:p-10">

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>Informes de Gestión</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Rendimiento en tiempo real basado en tu flujo de citas.</p>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="section-label mb-1">Ingresos Est.</p>
              <p className="font-display text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>${ingresosEst.toLocaleString('es-CO')}</p>
            </div>
            <div className="text-right">
              <p className="section-label mb-1" style={{ color: '#dc2626' }}>Egresos</p>
              <p className="font-display text-2xl font-semibold" style={{ color: '#dc2626' }}>-${expenses.total.toLocaleString('es-CO')}</p>
            </div>
          </div>
        </header>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map(kpi => (
            <div key={kpi.label} style={{ ...card, padding: '20px' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg" style={{ color: kpi.color, fontVariationSettings: '"FILL" 1' }}>{kpi.icon}</span>
                <p className="section-label">{kpi.label}</p>
              </div>
              <p className="font-display text-3xl font-semibold" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status distribution */}
          <div style={{ ...card, padding: '24px' }}>
            <p className="section-label mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>bar_chart</span>
              Distribución de Estado
            </p>
            <div className="space-y-5">
              {[
                { label: 'Confirmadas', count: confirmadas, color: '#16a34a' },
                { label: 'Pendientes', count: pendientes, color: '#d97706' },
                { label: 'Canceladas', count: canceladas, color: '#dc2626' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="section-label">{item.label}</span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-low)' }}>
                    <div className="h-full rounded-full" style={{ width: `${totalCitas > 0 ? (item.count / totalCitas) * 100 : 0}%`, background: item.color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation rate */}
          <div style={{ ...card, padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: `linear-gradient(135deg, var(--color-primary-container), var(--color-card))` }}>
            <p className="section-label mb-3" style={{ color: 'var(--color-primary)' }}>Tasa de Confirmación</p>
            <p className="font-display font-semibold mb-3" style={{ fontSize: '72px', lineHeight: 1, color: 'var(--color-text)' }}>{tasaConf}%</p>
            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)', maxWidth: '280px', margin: '0 auto' }}>
              {tasaConf >= 80 ? 'Excelente tasa. Activa recordatorios automáticos para maximizar asistencia.' : 'Hay oportunidad de mejora. Revisa motivos de cancelación.'}
            </p>
          </div>
        </div>

        {/* Appointments table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="section-label flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: 'var(--color-primary)' }}>table_rows</span>
              Registro Reciente de Citas
            </p>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            {appointments.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-5xl mb-3" style={{ color: 'var(--color-border-strong)', display: 'block' }}>calendar_today</span>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No hay citas registradas aún.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: 'var(--color-surface-low)' }}>
                    {['Cliente', 'Servicio', 'Profesional', 'Fecha', 'Estado'].map(col => (
                      <th key={col} className="px-5 py-4 section-label" style={{ borderBottom: '1px solid var(--color-border)' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(-10).reverse().map((app, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{app.clientName}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{app.clientEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{app.serviceName}</td>
                      <td className="px-5 py-4 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{staffMap[app.staffId] || '—'}</td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-text-faint)' }}>
                        {new Date(app.startTime).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{
                            background: (app.status === 'CONFIRMADA' || app.status === AppointmentStatus.CONFIRMED) ? 'rgba(22,163,74,0.10)' :
                              (app.status === 'CANCELADA' || app.status === AppointmentStatus.CANCELLED) ? 'rgba(220,38,38,0.10)' : 'rgba(217,119,6,0.10)',
                            color: (app.status === 'CONFIRMADA' || app.status === AppointmentStatus.CONFIRMED) ? '#16a34a' :
                              (app.status === 'CANCELADA' || app.status === AppointmentStatus.CANCELLED) ? '#dc2626' : '#d97706',
                          }}
                        >
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
