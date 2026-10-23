'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { importRepostsCsv } from '../lib/csv'
import { DashboardShell, SectionHeading } from './DashboardShell'
import { CheckIcon, ExternalIcon, LinkIcon, PlayIcon, ShieldIcon, UploadIcon, WandIcon } from './icons'
import styles from './repostflow.module.css'

type Repost = { id: string; title: string; author: string; createdAt: string; updatedAt: string; status: string; source?: string; verification?: { method: string; verifiedAt: string; evidence?: string } }

const fallback: Repost[] = [
  { id: 'demo-001', title: 'Morning routine', author: '@example_creator', createdAt: '2025-01-12T08:30:00.000Z', updatedAt: '2025-01-12T08:30:00.000Z', status: 'manual_required', source: 'https://www.tiktok.com/' },
  { id: 'demo-002', title: 'Street food tour', author: '@city_guides', createdAt: '2025-01-18T17:05:00.000Z', updatedAt: '2025-01-18T17:05:00.000Z', status: 'pending', source: 'https://www.tiktok.com/' },
]

const STORAGE_KEY = 'repostflow.records.v1'

function readLocalRecords(): Repost[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return null }
}

function saveLocalRecords(records: Repost[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) } catch { /* storage may be disabled */ }
}

function mergeRecords(...groups: Repost[][]): Repost[] {
  const merged = new Map<string, Repost>()
  groups.flat().forEach((record) => merged.set(record.id, record))
  return [...merged.values()]
}

export function ManualAssistant() {
  const [records, setRecords] = useState<Repost[]>([])
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<Repost | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const local = readLocalRecords()
    if (local !== null) setRecords(local)
    fetch('/api/reposts').then((r) => r.ok ? r.json() : Promise.reject()).then((data) => {
      const remote = Array.isArray(data.records) ? data.records : []
      const next = local !== null ? mergeRecords(local, remote) : (remote.length ? remote : fallback)
      setRecords(next)
      saveLocalRecords(next)
    }).catch(() => {
      const next = local !== null ? local : fallback
      setRecords(next)
      saveLocalRecords(next)
    })
  }, [])

  function validateUrl(value: string) {
    try { const parsed = new URL(value); return parsed.protocol === 'https:' && (parsed.hostname === 'tiktok.com' || parsed.hostname.endsWith('.tiktok.com')) } catch { return false }
  }

  async function addUrl() {
    const value = url.trim()
    if (!validateUrl(value)) { setMessage('أدخل رابطاً صحيحاً يبدأ بـ https://www.tiktok.com'); return }
    setBusy(true); setMessage('')
    const id = `manual-${Date.now().toString(36)}`
    const now = new Date().toISOString()
    const record: Repost = { id, title: 'رابط TikTok جديد', author: '@غير معروف', createdAt: now, updatedAt: now, status: 'manual_required', source: value, }
    try {
      const response = await fetch('/api/reposts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ records: [record] }) })
      if (!response.ok) throw new Error()
      const data = await response.json(); const next = Array.isArray(data.records) ? mergeRecords(records, data.records) : [...records, record]; setRecords(next); saveLocalRecords(next); setUrl(''); setMessage('تمت إضافة الرابط إلى قائمة الانتظار.')
    } catch { const next = [...records, record]; setRecords(next); saveLocalRecords(next); setUrl(''); setMessage('تم حفظ الرابط محلياً. يمكنك بدء الإزالة الآن.') }
    finally { setBusy(false) }
  }

  async function complete(record: Repost) {
    setBusy(true); setMessage('')
    try {
      // Demo records come from the read-only provider when the local store is empty.
      // Persist the selected record first so the audited completion endpoint can update it.
      const seed = await fetch('/api/reposts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ records: [record] }) })
      if (!seed.ok) throw new Error('تعذر حفظ العنصر قبل تأكيد الإزالة.')
      const response = await fetch(`/api/reposts/${encodeURIComponent(record.id)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'complete-manual', confirmed: true, confirmedAt: new Date().toISOString(), evidence: note.trim() || undefined }) })
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'تعذر تأكيد الإزالة.') }
      const data = await response.json(); const next = records.map((item) => item.id === record.id ? data.record : item); setRecords(next); saveLocalRecords(next); setSelected(null); setNote(''); setMessage('تم تسجيل الإزالة بعد تأكيدك.')
    } catch {
      const now = new Date().toISOString()
      const next = records.map((item) => item.id === record.id ? { ...item, status: 'removed', updatedAt: now, verification: { method: 'manual', verifiedAt: now, ...(note.trim() ? { evidence: note.trim() } : {}) } } : item)
      setRecords(next); saveLocalRecords(next); setSelected(null); setNote(''); setMessage('تم حفظ تأكيدك محلياً. لم يتحقق TikTok من العملية تلقائياً.')
    }
    finally { setBusy(false) }
  }

  function exportCsv() {
    const head = 'id,title,author,createdAt,status,updatedAt,source\n'
    const csv = head + records.map((r) => [r.id, r.title, r.author, r.createdAt, r.status, r.updatedAt, r.source ?? ''].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'repostflow-reposts.csv'; link.click(); URL.revokeObjectURL(link.href)
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return
    setBusy(true); setMessage('')
    try {
      const text = await file.text()
      const response = await fetch('/api/reposts', { method: 'POST', headers: { 'content-type': 'text/csv' }, body: text })
      if (response.ok) { const data = await response.json(); const next = Array.isArray(data.records) ? mergeRecords(records, data.records) : records; setRecords(next); saveLocalRecords(next); setMessage(`تم استيراد ${data.imported ?? 0} عنصراً.`); return }
      const local = importRepostsCsv(text)
      if (local.errors.length) throw new Error(local.errors[0].message)
      const next = mergeRecords(records, local.records)
      setRecords(next); saveLocalRecords(next); setMessage(`تم استيراد ${local.records.length} عنصراً محلياً.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر استيراد الملف.') } finally { setBusy(false); event.target.value = '' }
  }

  return <DashboardShell active="manual" title="مساعد الإزالة"><div className={styles.content}>
    <SectionHeading eyebrow="خطوة بخطوة" title="مساعد إزالة إعادة النشر" subtitle="أضف رابط TikTok، افتحه رسمياً، ثم أكّد اختفاء إعادة النشر." action={<span className={`${styles.status} ${styles.statusInfo}`}><ShieldIcon size={12}/> وضع آمن</span>} />
    {message && <div role="status" style={{ background: '#16353a', border: '1px solid #25615d', color: '#8de8d6', borderRadius: 8, padding: '10px 13px', fontSize: 11, marginBottom: 16 }}>{message}</div>}
    <div className={styles.layout2}>
      <section className={styles.card}><div className={styles.cardHead}><div><div className={styles.cardTitle}>أضف رابطاً إلى قائمة الانتظار</div><div className={styles.cardHint}>نستخدم الموقع الرسمي فقط ولا نطلب كلمة مرورك</div></div><span style={{ color: '#687993', fontSize: 11 }}>{records.length} عناصر</span></div><div style={{ padding: 20 }}><div style={{ display: 'flex', gap: 9 }}><input className={styles.input} style={{ flex: 1, direction: 'ltr' }} value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addUrl() }} placeholder="https://www.tiktok.com/@user/video/..." aria-label="رابط TikTok"/><button className={styles.primaryButton} onClick={addUrl} disabled={busy}><LinkIcon size={14}/> إضافة</button></div><div className={styles.toolRow}><button className={styles.softButton} onClick={() => fileRef.current?.click()}><UploadIcon size={13}/> استيراد CSV</button><input ref={fileRef} type="file" accept=".csv,text/csv" onChange={importCsv} hidden/><button className={styles.softButton} onClick={exportCsv}>تصدير القائمة ↓</button></div></div><div className={styles.cardHead}><div><div className={styles.cardTitle}>الخطوات</div><div className={styles.cardHint}>اتبعها لكل عنصر</div></div></div><div className={styles.stepper}><Step no="١" title="افتح TikTok" hint="افتح الرابط من الموقع الرسمي وتحقق من الحساب." done={false}/><Step no="٢" title="أزل إعادة النشر" hint="اضغط مشاركة ثم إزالة إعادة النشر داخل TikTok." done={false}/><Step no="٣" title="أكّد النتيجة" hint="بعد اختفاء الفيديو، اضغط تأكيد بجانب العنصر." done={false}/></div></section>
      <section className={styles.card}><div className={styles.cardHead}><div><div className={styles.cardTitle}>قائمة الانتظار</div><div className={styles.cardHint}>{records.filter((item) => item.status !== 'removed').length} عناصر بانتظار المعالجة</div></div></div><div className={styles.activityList}>{records.map((record) => <QueueItem key={record.id} record={record} onOpen={() => { if (record.source) window.open(record.source, '_blank', 'noopener,noreferrer') }} onSelect={() => setSelected(record)}/>)}</div>{!records.length && <div className={styles.empty}>لا توجد روابط بعد. أضف رابط TikTok للبدء.</div>}</section>
    </div>
    {selected && <section className={`${styles.card} ${styles.sectionGap}`}><div className={styles.cardHead}><div><div className={styles.cardTitle}>تأكيد إزالة إعادة النشر</div><div className={styles.cardHint}>{selected.title} · {selected.author}</div></div><button className={styles.softButton} onClick={() => setSelected(null)}>إلغاء</button></div><div style={{ padding: 20 }}><p style={{ color: '#b9c6d8', fontSize: 12, margin: '0 0 12px' }}>تحقق من اختفاء إعادة النشر في تطبيق TikTok، ثم سجّل التأكيد لحفظه في السجل.</p><textarea className={styles.input} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="ملاحظة اختيارية أو دليل التحقق" style={{ width: '100%', resize: 'vertical' }}/><button className={styles.primaryButton} style={{ marginTop: 13 }} onClick={() => complete(selected)} disabled={busy}><CheckIcon size={14}/> تأكيد الإزالة</button></div></section>}
  </div></DashboardShell>
}

function Step({ no, title, hint, done }: { no: string; title: string; hint: string; done: boolean }) { return <div className={`${styles.step} ${done ? styles.stepDone : ''}`}><div className={styles.stepNo}>{done ? <CheckIcon size={13}/> : no}</div><div><div className={styles.stepTitle}>{title}</div><div className={styles.stepHint}>{hint}</div></div></div> }
function QueueItem({ record, onOpen, onSelect }: { record: Repost; onOpen: () => void; onSelect: () => void }) { const removed = record.status === 'removed'; return <div className={styles.activityItem}><div className={`${styles.videoThumb} ${removed ? styles.videoThumbAlt : ''}`} style={{ width: 33, height: 39 }}><PlayIcon size={13}/></div><div className={styles.activityMain}><div className={styles.activityText}>{record.title}</div><div className={styles.activityTime} dir="ltr">{record.author}</div></div><button className={styles.softButton} style={{ padding: '6px 8px' }} onClick={onOpen} aria-label="فتح الرابط"><ExternalIcon size={12}/></button>{removed ? <span className={`${styles.status} ${styles.statusDone}`}>مكتمل</span> : <button className={`${styles.status} ${styles.statusPending}`} style={{ border: 0, cursor: 'pointer' }} onClick={onSelect}>تأكيد</button>}</div> }
