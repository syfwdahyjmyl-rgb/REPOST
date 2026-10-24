'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { ActivityIcon, BellIcon, ChevronDownIcon, HomeIcon, ListIcon, MenuIcon, SettingsIcon, ShieldIcon, WandIcon } from './icons'
import styles from './repostflow.module.css'

type PageKey = 'dashboard' | 'manual' | 'activity' | 'settings'
const navItems: Array<{ key: PageKey; label: string; href: string; Icon: typeof HomeIcon }> = [
  { key: 'dashboard', label: 'نظرة عامة', href: '/dashboard', Icon: HomeIcon },
  { key: 'manual', label: 'مساعد الإزالة', href: '/manual', Icon: WandIcon },
  { key: 'activity', label: 'سجل النشاط', href: '/activity', Icon: ActivityIcon },
  { key: 'settings', label: 'الإعدادات', href: '/settings', Icon: SettingsIcon },
]

export function DashboardShell({ active, title, children }: { active: PageKey; title: string; children: ReactNode }) {
  const [english, setEnglish] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className={styles.page} lang={english ? 'en' : 'ar'} dir="rtl">
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="التنقل الرئيسي">
          <Link href="/dashboard" className={styles.brand}>
            <span className={styles.brandMark}>↻</span>
            <span className={styles.brandName}>Repost<span>Flow</span></span>
          </Link>
          <div style={{ margin: '0 5px 20px', padding: '9px 11px', border: '1px solid #6b3b63', borderRadius: 9, background: '#2b1b31', color: '#f0a9d5', fontSize: 10, lineHeight: 1.5 }}>
            وضع تجريبي · البيانات خيالية
          </div>
          <div className={styles.navLabel}>مساحة العمل</div>
          <nav className={styles.nav}>
            {navItems.map(({ key, label, href, Icon }) => <Link key={key} href={href} className={`${styles.navItem} ${active === key ? styles.navItemActive : ''}`}><Icon size={17} />{english ? ({ dashboard: 'Overview', manual: 'Removal assistant', activity: 'Activity log', settings: 'Settings' } as Record<PageKey,string>)[key] : label}</Link>)}
          </nav>
          <div className={styles.sidebarBottom}>
            <div className={styles.helpCard}>
              <div className={styles.helpIcon}><ShieldIcon size={18}/></div>
              <div className={styles.helpTitle}>{english ? 'Your privacy matters' : 'خصوصيتك أولاً'}</div>
              <div className={styles.helpText}>{english ? 'Your TikTok password is never requested or stored.' : 'لن نطلب كلمة مرور TikTok الخاصة بك أو نخزنها أبداً.'}</div>
              <a className={styles.helpLink} href="#privacy">{english ? 'Learn more' : 'اعرف المزيد'} <ChevronDownIcon size={11}/></a>
            </div>
            <div className={styles.profile}><div className={styles.avatar}>م</div><div><div className={styles.profileName}>{english ? 'Marwan Ahmed' : 'مروان أحمد'}</div><div className={styles.profileEmail}>marwan@example.com</div></div><ChevronDownIcon size={14}/></div>
          </div>
        </aside>
        <main className={styles.main}>
          <header className={styles.topbar}>
            <button className={styles.mobileMenu} onClick={() => setMenuOpen(!menuOpen)} aria-label="فتح القائمة"><MenuIcon size={20}/></button>
            <div className={styles.crumb}><Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>الرئيسية</Link><span>/</span><strong>{title}</strong></div>
            <div className={styles.topActions}>
              <button className={styles.langButton} onClick={() => setEnglish(!english)} aria-label="تغيير اللغة">{english ? 'العربية' : 'EN'}</button>
              <button className={styles.iconButton} aria-label="الإشعارات"><BellIcon size={18}/><span className={styles.noticeDot}/></button>
            </div>
          </header>
          {menuOpen && <div style={{ position: 'absolute', zIndex: 5, top: 62, right: 12, left: 12, background: '#111a2a', border: '1px solid #2a3c53', borderRadius: 10, padding: 8 }}>{navItems.map(({ key, label, href, Icon }) => <Link key={key} href={href} className={styles.navItem}><Icon size={17}/>{label}</Link>)}</div>}
          {children}
        </main>
      </div>
    </div>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className={styles.headingRow}><div>{eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}<h1 className={styles.title}>{title}</h1>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>{action}</div>
}

export function StatCard({ label, value, foot, icon, tone = 'teal' }: { label: string; value: string; foot: ReactNode; icon?: ReactNode; tone?: 'teal' | 'pink' }) {
  return <div className={styles.statCard}><div className={styles.statLabel}>{label}</div><div className={`${styles.statValue} ${tone === 'pink' ? styles.pink : ''}`}>{value}</div><div className={styles.statFoot}>{foot}</div>{icon && <div className={styles.statIcon}>{icon}</div>}</div>
}
