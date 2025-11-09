// React 19 JSX 运行时无需默认导入 React
import BackgroundContainer from '../components/BackgroundContainer.tsx'

export default function Archive() {
  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-6">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>归档</h1>
          <a href="/app" style={{ textDecoration: 'none', color: '#60a5fa' }}>返回主页</a>
        </header>
        <section style={{ marginTop: 16, lineHeight: 1.8 }}>
          <p style={{ opacity: 0.85 }}>这里将展示已归档的任务列表与筛选（占位）。</p>
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8 }}>
            <li>支持按类别、日期、关键字搜索</li>
            <li>后续可添加批量还原/删除功能</li>
          </ul>
        </section>
      </div>
    </BackgroundContainer>
  )
}