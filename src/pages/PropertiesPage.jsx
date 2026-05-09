import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// フォームの初期値
const EMPTY_FORM = { name: '', rent: '', area: '', layout: '' }

export default function PropertiesPage() {
  const navigate = useNavigate()

  // ログイン中ユーザー情報
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState(null)

  // 物件一覧データ
  const [properties, setProperties] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  // 追加・編集フォームの表示状態
  const [showForm, setShowForm] = useState(false)
  // 編集対象の物件（nullなら新規登録モード）
  const [editingProperty, setEditingProperty] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // 削除処理中のID（ボタン連打防止）
  const [deletingId, setDeletingId] = useState(null)

  // ─────────────────────────────────────────────
  // 初期化: ユーザー情報の取得と物件一覧の取得
  // ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email)
        setUserId(user.id)
        await fetchProperties()
      }
    }
    init()
  }, [])

  // ─────────────────────────────────────────────
  // SELECT: Supabaseから自分の物件一覧を取得
  // RLSにより自分が登録した物件のみ返される
  // ─────────────────────────────────────────────
  const fetchProperties = async () => {
    setLoadingList(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('物件取得エラー:', error.message)
    } else {
      setProperties(data)
    }
    setLoadingList(false)
  }

  // ─────────────────────────────────────────────
  // INSERT / UPDATE: フォーム送信
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const rentNum = parseInt(formData.rent, 10)
    if (isNaN(rentNum) || rentNum <= 0) {
      setFormError('家賃は1以上の整数で入力してください。')
      return
    }

    setFormLoading(true)

    if (editingProperty) {
      // UPDATE: 既存物件を更新
      const { error } = await supabase
        .from('properties')
        .update({
          name: formData.name,
          rent: rentNum,
          area: formData.area,
          layout: formData.layout,
        })
        .eq('id', editingProperty.id)

      if (error) {
        setFormError('更新に失敗しました: ' + error.message)
        setFormLoading(false)
        return
      }
    } else {
      // INSERT: 新規物件を登録（user_idはRLSポリシーの WITH CHECK と照合される）
      const { error } = await supabase
        .from('properties')
        .insert({
          name: formData.name,
          rent: rentNum,
          area: formData.area,
          layout: formData.layout,
          user_id: userId,
        })

      if (error) {
        setFormError('登録に失敗しました: ' + error.message)
        setFormLoading(false)
        return
      }
    }

    setFormLoading(false)
    closeForm()
    // 一覧を再取得して最新状態に更新
    await fetchProperties()
  }

  // ─────────────────────────────────────────────
  // DELETE: 物件を削除
  // ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('この物件を削除しますか？')) return

    setDeletingId(id)
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    setDeletingId(null)

    if (error) {
      alert('削除に失敗しました: ' + error.message)
      return
    }

    // 削除成功：ローカルのstateからも除去
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  // ─────────────────────────────────────────────
  // フォームの開閉ヘルパー
  // ─────────────────────────────────────────────
  const openAddForm = () => {
    setEditingProperty(null)
    setFormData(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (property) => {
    setEditingProperty(property)
    setFormData({
      name: property.name,
      rent: String(property.rent),
      area: property.area,
      layout: property.layout,
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProperty(null)
    setFormData(EMPTY_FORM)
    setFormError('')
  }

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ─────────────────────────────────────────────
  // ログアウト
  // ─────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // ─────────────────────────────────────────────
  // レンダリング
  // ─────────────────────────────────────────────
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
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.pageTitle}>物件一覧</h2>
            {!loadingList && (
              <p style={styles.count}>{properties.length}件の物件</p>
            )}
          </div>
          <button onClick={openAddForm} style={styles.addBtn}>
            ＋ 物件を登録
          </button>
        </div>

        {/* ローディング表示 */}
        {loadingList && (
          <p style={styles.loadingText}>読み込み中...</p>
        )}

        {/* 物件がない場合 */}
        {!loadingList && properties.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>登録された物件がありません。</p>
            <p style={styles.emptySubText}>「物件を登録」ボタンから追加してください。</p>
          </div>
        )}

        {/* 物件カードグリッド */}
        <div style={styles.grid}>
          {properties.map((property) => (
            <div key={property.id} style={styles.card}>
              <span style={styles.badge}>{property.layout}</span>
              <h3 style={styles.propertyName}>{property.name}</h3>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>エリア</span>
                <span style={styles.infoValue}>{property.area}</span>
              </div>

              <div style={styles.rentRow}>
                <span style={styles.rent}>¥{property.rent.toLocaleString()}</span>
                <span style={styles.rentUnit}> / 月</span>
              </div>

              {/* 編集・削除ボタン */}
              <div style={styles.cardActions}>
                <button
                  onClick={() => openEditForm(property)}
                  style={styles.editBtn}
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  disabled={deletingId === property.id}
                  style={styles.deleteBtn}
                >
                  {deletingId === property.id ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ─── 追加・編集モーダル ─── */}
      {showForm && (
        <div style={styles.overlay} onClick={closeForm}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingProperty ? '物件を編集' : '物件を登録'}
            </h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>物件名</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="例：サンシャインマンション 302号室"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>家賃（円）</label>
                <input
                  name="rent"
                  type="number"
                  value={formData.rent}
                  onChange={handleFormChange}
                  placeholder="例：85000"
                  min="1"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>エリア名</label>
                <input
                  name="area"
                  value={formData.area}
                  onChange={handleFormChange}
                  placeholder="例：東京都新宿区"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>間取り</label>
                <input
                  name="layout"
                  value={formData.layout}
                  onChange={handleFormChange}
                  placeholder="例：1LDK"
                  required
                  style={styles.input}
                />
              </div>

              {/* フォームエラー */}
              {formError && <p style={styles.formError}>{formError}</p>}

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={closeForm}
                  style={styles.cancelBtn}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={editingProperty ? styles.updateBtn : styles.saveBtn}
                >
                  {formLoading
                    ? '保存中...'
                    : editingProperty
                    ? '更新する'
                    : '登録する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// スタイル定義
// ─────────────────────────────────────────────
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
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px',
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
    margin: 0,
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#2b6cb0',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  loadingText: {
    color: '#718096',
    textAlign: 'center',
    marginTop: '60px',
  },
  empty: {
    textAlign: 'center',
    marginTop: '80px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#4a5568',
    margin: '0 0 8px',
  },
  emptySubText: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
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
    margin: '0 0 12px',
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
    marginBottom: '16px',
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
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#ecc94b',
    color: '#744210',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteBtn: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#fed7d7',
    color: '#c53030',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // モーダル
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '16px',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  formError: {
    color: '#e53e3e',
    fontSize: '14px',
    margin: 0,
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#38a169',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  updateBtn: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
