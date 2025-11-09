import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackgroundContainer from '../components/BackgroundContainer'
import GlareHover from '../components/reactbits/GlareHover'
import { clearSession } from '../lib/session'
import { permissionStatus, requestPermission } from '../lib/notifications'

export default function Settings() {
  const nav = useNavigate()
  const [perm, setPerm] = useState(permissionStatus())
  const isNative = typeof (window as any).Capacitor !== 'undefined' && typeof (window as any).Capacitor.isNativePlatform === 'function' && (window as any).Capacitor.isNativePlatform()
  const permText = useMemo(() => {
    if (perm === 'unsupported') return '当前环境不支持通知'
    if (perm === 'granted') return '通知已授权'
    if (perm === 'denied') return '通知被拒绝'
    return '尚未授权'
  }, [perm])

  async function onRequest() {
    const ok = await requestPermission()
    setPerm(permissionStatus())
    if (!ok) {
      alert('授权失败或被拒绝，请到系统设置中启用通知权限')
    }
  }

  function onLogout() {
    clearSession()
    nav('/login', { replace: true })
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[720px] mx-auto p-6">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>设置</h1>
          <GlareHover>
            <button onClick={() => nav('/app')}>返回</button>
          </GlareHover>
        </header>

        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: '8px 0' }}>通知权限</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div>状态：{permText}</div>
            <GlareHover>
              <button onClick={onRequest}>请求授权</button>
            </GlareHover>
          </div>
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            Web 端仅演示即时提醒；定时提醒以 iOS 应用的本地通知为准。
            {isNative && '（原生平台将弹出系统授权窗口，授权后即可后台触发到期与预提醒）'}
          </p>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ margin: '8px 0' }}>账户</h2>
          <GlareHover>
            <button onClick={onLogout}>退出登录</button>
          </GlareHover>
        </section>
      </div>
    </BackgroundContainer>
  )
}