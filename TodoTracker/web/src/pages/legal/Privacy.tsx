// React 19 JSX 运行时无需默认导入 React
import BackgroundContainer from '../../components/BackgroundContainer.tsx'
import GlareHover from '../../components/reactbits/GlareHover.tsx'

export default function Privacy() {
  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[800px] mx-auto p-6">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>隐私政策（占位）</h1>
          <GlareHover>
            <a href="/register"><button>返回注册</button></a>
          </GlareHover>
        </header>
        <section style={{ marginTop: 16, lineHeight: 1.8 }}>
          <p>这是 TodoTracker 的隐私政策占位页面，用于演示产品流程。在实际发布前，请替换为正式文本并包含：</p>
          <ul>
            <li>数据收集范围与目的</li>
            <li>数据存储与安全</li>
            <li>第三方服务与共享</li>
            <li>用户权利与数据删除</li>
            <li>联系方式</li>
          </ul>
        </section>
      </div>
    </BackgroundContainer>
  )
}