import React from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import { useAgent } from './features/nutrition/hooks/useAgent';
import { useSocket } from './features/nutrition/hooks/useSocket';
import { SuccessChart } from './features/nutrition/components/SuccessChart';
import { 
  LayoutDashboard, User, Settings, LogOut, Flame, 
  Activity, Moon, Dumbbell, AlertTriangle, Target, TrendingDown 
} from 'lucide-react';

function App() {
  const userId = "cristian_bisbicus"; 
  const { logs, analysis, roadmap, sendLog, loading, fetchLogs } = useAgent(userId);

  useSocket(fetchLogs, userId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
     
      const response = await sendLog(data);      
    
      if (response.agentMessage) {
        toast.success(response.agentMessage);
      }
      
      form.reset();
    } catch (err: any) {      
      const serverErrorMessage = err.response?.data?.message || "Error de comunicación";
      toast.error(serverErrorMessage);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FE' }}>
      <Toaster position="top-right" reverseOrder={false} />
      
      <aside className="fitco-sidebar">
        <div className="sidebar-logo">FITCO <span style={{color: '#00C2A0'}}>NUTRI</span></div>
        <nav style={{ flex: 1 }}>
          <div className="nav-item active"><LayoutDashboard size={20} /> <span>Dashboard</span></div>
          <div className="nav-item"><User size={20} /> <span>Mi Perfil</span></div>
          <div className="nav-item"><Settings size={20} /> <span>Ajustes</span></div>
        </nav>
        <div className="nav-item" style={{ marginTop: 'auto', borderTop: '1px solid #2D3748', paddingTop: '20px' }}>
          <LogOut size={20} /> <span>Cerrar Sesión</span>
        </div>
      </aside>

      <div className="main-wrapper">
        <header>
          <div>
            <h2 style={{ fontWeight: '900', margin: 0 }}>NutriCore / Dashboard</h2>
            <p style={{ fontSize: '11px', color: '#64748B' }}>
              {new Intl.DateTimeFormat('es-ES', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
              }).format(new Date()).replace(/^\w/, (c) => c.toUpperCase())}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{userId}</span>
            <div style={{ width: '40px', height: '40px', background: '#1A2332', borderRadius: '50%', border: '2px solid #00C2A0' }}></div>
          </div>
        </header>

        {analysis?.isStagnated && (
          <div className="stagnation-alert">
            <AlertTriangle color="#D97706" size={20} />
            <div>
              <b>Detección de Estancamiento:</b> Tu variación es menor a 0.3kg. El agente sugiere ajuste.
            </div>
          </div>
        )}

        <div className="kpi-grid">
          {[
            { t: 'Peso Actual', v: logs?.[0]?.weight || '0.0', u: 'kg', c: '#059669' },
            { t: 'Promedio 7D', v: analysis?.averageWeight?.toFixed(1) || '0.0', u: 'kg', c: '#6366F1' },
            { t: 'Calorías', v: logs?.[0]?.calories || '0', u: 'kcal', c: '#D97706' },
            { t: 'Grasa', v: logs?.[0]?.fat || '0', u: 'g', c: '#2563EB' }
          ].map((k, i) => (
            <div key={i} className="kpi-box">
              <div className="kpi-label">{k.t.toUpperCase()}</div>
              <div className="kpi-value" style={{ color: k.c }}>{k.v} <small style={{fontSize: '12px'}}>{k.u}</small></div>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <div className="left-column">
            <div className="fitco-card">
              <h3 className="card-title">NUEVO REGISTRO</h3>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label><Activity size={12}/> PESO (KG)</label>
                  <input name="weight" type="number" step="0.1" placeholder="82.5" required />
                </div>
                <div className="input-group">
                  <label><Flame size={12}/> CALORÍAS (KCAL)</label>
                  <input name="calories" type="number" placeholder="1800" required />
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label>GRASA (G)</label>
                    <input name="fat" type="number" placeholder="65" required />
                  </div>
                  <div className="input-group">
                    <label><Moon size={12}/> SUEÑO (H)</label>
                    <input name="sleepHours" type="number" placeholder="5" required />
                  </div>
                </div>
                <div className="input-group">
                  <label><Dumbbell size={12}/> ACTIVIDAD</label>
                  <select name="activityLevel">
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta (Atleta)</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'ENVIANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </form>
            </div>

            <div className="roadmap-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} color="#00C2A0" />
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px' }}>OBJETIVO</span>
              </div>
              <div className="roadmap-main">{roadmap?.estimatedRemainingLogs || '--'}</div>
              <div className="roadmap-sub">FALTANTE PARA LA META (75kg)</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '65%' }}></div>
              </div>
              <p className="roadmap-footer">Progreso total: <b>{roadmap?.totalLost || '0'} kg</b> perdidos.</p>
            </div>
          </div>

          <div className="fitco-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 className="card-title">TENDENCIA METABÓLICA</h3>
              <div className="trend-badge">
                <TrendingDown size={14} /> {analysis?.trend || 'STABLE'}
              </div>
            </div>
            <div style={{ width: '100%', height: '350px' }}>
              {logs && logs.length > 0 ? (
                <SuccessChart data={logs} />
              ) : (
                <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8'}}>
                  Esperando datos de la IA...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;