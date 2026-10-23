import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }
// Each icon is created by the same small factory; the rule cannot infer a
// display name from the generated component.
// eslint-disable-next-line react/display-name
const icon = (path: ReactNode) => ({ size = 20, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{path}</svg>
)

export const HomeIcon = icon(<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></>)
export const ListIcon = icon(<><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>)
export const WandIcon = icon(<><path d="m15 4 5 5"/><path d="M14 5 4 15l-1 5 5-1L18 9"/><path d="m5 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></>)
export const ActivityIcon = icon(<><path d="M3 12h4l2-7 4 14 2-7h6"/></>)
export const SettingsIcon = icon(<><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.65 1.65-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.34v-.25a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.65-1.65.06-.06A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.56-1.03H6.8v-2.34h.24A1.7 1.7 0 0 0 8.6 10.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.65-1.65.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5.6h2.34v.25a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l-.06-.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.24v2.34h-.24A1.7 1.7 0 0 0 19.4 15z"/></>)
export const BellIcon = icon(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>)
export const SearchIcon = icon(<><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>)
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6"/>)
export const ArrowUpIcon = icon(<><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>)
export const ArrowLeftIcon = icon(<><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>)
export const PlayIcon = icon(<path d="m9 6 9 6-9 6z"/>)
export const MoreIcon = icon(<><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>)
export const CheckIcon = icon(<path d="m5 12 4 4L19 6"/>)
export const ClockIcon = icon(<><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>)
export const ShieldIcon = icon(<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></>)
export const ExternalIcon = icon(<><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></>)
export const LinkIcon = icon(<><path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.14 1.14"/><path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.14-1.14"/></>)
export const UploadIcon = icon(<><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>)
export const MenuIcon = icon(<><path d="M4 6h16M4 12h16M4 18h16"/></>)
