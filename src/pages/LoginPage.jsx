import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Supabaseでメール・パスワード認証を実行
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません。')
      return
    }

    navigate('/properties')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ログイン</h1>
        <p style={styles.subtitle}>不動産管理アプリ</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              style={styles.input}
            />
          </div>

          {/* エラーメッセージ表示 */}
          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p style={styles.link}>
          アカウントをお持ちでない方は{' '}
          <Link to="/register" style={styles.anchor}>会員登録</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '14px',
    color: '#718096',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    margin: '0',
  },
  button: {
    padding: '12px',
    backgroundColor: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  link: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#4a5568',
  },
  anchor: {
    color: '#3182ce',
    fontWeight: '600',
  },
}
