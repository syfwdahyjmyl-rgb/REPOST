'use client'

import { useState } from 'react'
import styles from './repostflow.module.css'

export function DataControls() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function deleteLocalData() {
    if (!window.confirm('سيتم حذف قائمة التتبع المحلية وسجل التقدم. هل تريد المتابعة؟')) return
    setBusy(true)
    setMessage('')
    try { window.localStorage.removeItem('repostflow.records.v1') } catch { /* storage may be disabled */ }
    try {
      const response = await fetch('/api/reposts', { method: 'DELETE' })
      if (!response.ok) throw new Error()
      setMessage('تم حذف بيانات التتبع المحلية.')
    } catch {
      setMessage('تم حذف البيانات من هذا المتصفح. تعذر تحديث التخزين الخادمي.')
    } finally {
      setBusy(false)
    }
  }

  return <div style={{ padding: '17px 20px', borderTop: '1px solid #202a3c' }}>
    <div style={{ color: '#d9e1ed', fontSize: 12, marginBottom: 5 }}>حذف بيانات التتبع المحلية</div>
    <p style={{ color: '#71809a', fontSize: 10, lineHeight: 1.6, margin: '0 0 12px' }}>يمسح قائمة الروابط والتقدم من هذا الجهاز فقط، ولا يحذف أي شيء من TikTok.</p>
    <button className={styles.softButton} style={{ color: '#ed7a9a', borderColor: '#573346' }} onClick={deleteLocalData} disabled={busy}>{busy ? 'جارٍ الحذف…' : 'حذف البيانات المحلية'}</button>
    {message && <span role="status" style={{ color: '#8de8d6', fontSize: 10, marginRight: 10 }}>{message}</span>}
  </div>
}
