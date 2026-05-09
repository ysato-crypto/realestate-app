import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) {
      setError('パスワードが一致しません。')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。')
      return
    }

    setLoading(true)

    // Supabaseで新規ユーザー登録
    const { error } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (error) {
      setError('登録に失敗しました。別のメールアドレスをお試しください。')
      return
    }

    // 確認メール送信後のメッセージ
    setMessage('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>会員登録</h1>
        <p style={styles.subtitle}>不動産管理アプリ</p>

        <form onSubmit={handleRegister} style={styles.form}>
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
            <label style={styles.label}>パスワード（6文字以上）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>パスワード（確認）</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="もう一度入力"
              required
              style={styles.input}
            />
          </div>

          {/* エラーメッセージ */}
          {error && <p style={styles.error}>{error}</p>}

          {/* 成功メッセージ */}
          {message && <p style={styles.success}>{message}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        <p style={styles.link}>
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" style={styles.anchor}>ログイン</Link>
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
  success: {
    color: '#38a169',
    fontSize: '14px',
    margin: '0',
  },
  button: {
    padding: '12px',
    backgroundColor: '#38a169',
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
