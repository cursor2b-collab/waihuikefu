import { ChatWindow } from './components/ChatWindow';
import { AgentDashboard } from './components/AgentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  // 通过 URL 参数判断是客服后台还是客户界面
  // 访问 ?mode=agent 进入客服后台（新样式）
  // 访问 ?mode=admin 进入管理后台（完整功能）
  // 默认显示客户界面
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  // 管理后台使用原样式，不需要 dark 类
  if (mode === 'admin') {
    return (
      <div className="admin-mode">
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className={mode === 'agent' ? 'dark min-h-screen' : ''} style={mode === 'agent' ? { backgroundColor: '#0a0a0a' } : {}}>
      {mode === 'agent' ? (
        <AgentDashboard />
      ) : (
        <ChatWindow />
      )}
    </div>
  );
}