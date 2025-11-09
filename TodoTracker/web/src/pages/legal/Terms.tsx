// React 19 JSX 运行时无需默认导入 React
import BackgroundContainer from '../../components/BackgroundContainer.tsx'
import GlareHover from '../../components/reactbits/GlareHover.tsx'

export default function Terms() {
  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[800px] mx-auto p-6">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>用户协议（占位）</h1>
          <GlareHover>
            <a href="/register"><button>返回注册</button></a>
          </GlareHover>
        </header>
        <section style={{ marginTop: 16, lineHeight: 1.8 }}>
          <p>这是 TodoTracker 的用户协议占位页面，用于演示产品流程。在实际发布前，请替换为正式文本并包含：</p>
          <ul>
            <li>服务内容与用户责任</li>
            <li>账户安全与使用规范</li>
            <li>付费与退款（如适用）</li>
            <li>免责声明与争议解决</li>
            <li>协议变更与通知</li>
          </ul>
        </section>
      </div>
    </BackgroundContainer>
  )
}