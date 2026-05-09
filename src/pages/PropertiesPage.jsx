import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ダミーの物件データ
const DUMMY_PROPERTIES = [
  { id: 1, name: 'サンシャインマンション 302号室', rent: 85000, area: '東京都新宿区', type: '1LDK', size: '42㎡' },
  { id: 2, name: 'グリーンハイツ 501号室', rent: 72000, area: '東京都渋谷区', type: '1K', size: '28㎡' },
  { id: 3, name: 'ブルーリバーアパート 201号室', rent: 95000, area: '神奈川県横浜市', type: '2LDK', size: '58㎡' },
  { id: 4, name: 'オークタワー 1002号室', rent: 120000, area: '東京都港区', type: '2LDK', size: '65㎡' },
  { id: 5, name: 'メープルコート 103号室', rent: 62000, area: '埼玉県さいたま市', type: '1K', size: '25㎡' },
  { id: 6, name: 'チェリーブロッサム 405号室', rent: 78000, area: '東京都中野区', type: '1DK', size: '35㎡' },
]

export default function PropertiesPage() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // ログイン中ユーザーのメールアドレスを取得
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    // Supabaseからサインアウト
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={styles.page}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.logo}>不動産管理アプリ</h1>
          <div style={styles.headerRight}>
            <span style={styles.email}>{userEmail}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={styles.main}>
        <h2 style={styles.pageTitle}>物件一覧</h2>
        <p style={styles.count}>{DUMMY_PROPERTIES.length}件の物件</p>

        {/* 物件カードグリッド */}
        <div style={styles.grid}>
          {DUMMY_PROPERTIES.map((property) => (
            <div key={property.id} style={styles.card}>
              {/* 物件タイプバッジ */}
              <span style={styles.badge}>{property.type}</span>

              <h3 style={styles.propertyName}>{property.name}</h3>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>エリア</span>
                <span style={styles.infoValue}>{property.area}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>広さ</span>
                <span style={styles.infoValue}>{property.size}</span>
              </div>

              <div style={styles.rentRow}>
                <span style={styles.rent}>¥{property.rent.toLocaleString()}</span>
                <span style={styles.rentUnit}> / 月</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#2b6cb0',
    padding: '0 24px',
  },
  headerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  email: {
    color: '#bee3f8',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 4px',
  },
  count: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 10px',
    borderRadius: '999px',
    marginBottom: '12px',
  },
  propertyName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 16px',
    lineHeight: '1.4',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#718096',
  },
  infoValue: {
    fontSize: '13px',
    color: '#4a5568',
    fontWeight: '500',
  },
  rentRow: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'baseline',
  },
  rent: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2b6cb0',
  },
  rentUnit: {
    fontSize: '13px',
    color: '#718096',
  },
}
