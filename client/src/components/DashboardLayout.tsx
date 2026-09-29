import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

import AIAssistant from './AIAssistant';

export default function DashboardLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', paddingTop: 'var(--navbar-h)' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            marginLeft: 'var(--sidebar-w)',
            minHeight: 'calc(100vh - var(--navbar-h))',
            padding: '40px 40px 60px',
            maxWidth: 'calc(var(--content-max) - var(--sidebar-w))',
          }}
        >
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
