// React 19 JSX 运行时无需默认导入 React
import BackgroundContainer from '../components/BackgroundContainer.tsx'

export default function Me() {
  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-6">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>我的</h1>
          <a href="/settings" style={{ textDecoration: 'none', color: '#60a5fa' }}>去设置</a>
        </header>
        <section style={{ marginTop: 16, lineHeight: 1.8 }}>
          <p style={{ opacity: 0.85 }}>个人主页（占位）：在此展示账户信息、统计与偏好。</p>
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8 }}>
            <li>任务完成统计、连续天数</li>
            <li>通知权限与提醒偏好概览</li>
          </ul>
        </section>
      </div>
    </BackgroundContainer>
  )
}