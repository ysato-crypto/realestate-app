import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// 未ログインの場合にログイン画面へリダイレクトするラッパーコンポーネント
export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // 現在のセッション情報を取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // セッション変化をリアルタイムで監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // セッション確認中はローディング表示
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#718096' }}>読み込み中...</p>
      </div>
    )
  }

  // 未ログインの場合はログイン画面へリダイレクト
  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
