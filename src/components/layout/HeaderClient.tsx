'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Search, User, Menu, X, ChevronDown } from 'lucide-react'

export type NavChild = { label: string; href: string }
export type NavItem = { label: string; href: string; children?: NavChild[] }

export function HeaderClient({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="font-display font-bold text-xl text-neutral-900">THE UAE <span className="text-primary">JUNCTION</span></Link>
          <nav className="hidden lg:flex items-center gap-6">
            {nav.map(item => item.children?.length ? (
              <div key={item.label} className="relative group">
                <button className="flex items-center gap-1 text-neutral-700 hover:text-primary font-medium text-sm transition-colors">{item.label}<ChevronDown className="w-4 h-4" /></button>
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-card shadow-card-hover py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {item.children.map(c => <Link key={c.href + c.label} href={c.href} className="block px-4 py-2 text-sm text-neutral-700 hover:text-primary hover:bg-neutral-50">{c.label}</Link>)}
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href} className="text-neutral-700 hover:text-primary font-medium text-sm transition-colors">{item.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button aria-label="Search" className="p-2 text-neutral-600 hover:text-primary"><Search className="w-5 h-5" /></button>
            <Link href="/cart" className="relative p-2 text-neutral-600 hover:text-primary"><ShoppingCart className="w-5 h-5" /><span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span></Link>
            <Link href="/my-account" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-btn text-sm font-semibold transition-colors"><User className="w-4 h-4" />Login</Link>
            <button className="lg:hidden p-2 text-neutral-600" onClick={() => setOpen(!open)}>{open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
      </div>
      {open && <div className="lg:hidden bg-white border-t border-neutral-100 px-4 py-4 space-y-2">
        {nav.map(item => item.children?.length ? (
          <details key={item.label} className="group"><summary className="flex items-center justify-between py-2 text-neutral-700 font-medium cursor-pointer list-none">{item.label}<ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" /></summary>
          <div className="pl-4 mt-1 space-y-1">{item.children.map(c => <Link key={c.href + c.label} href={c.href} className="block py-1.5 text-sm text-neutral-600 hover:text-primary" onClick={() => setOpen(false)}>{c.label}</Link>)}</div></details>
        ) : (
          <Link key={item.label} href={item.href} className="block py-2 text-neutral-700 font-medium hover:text-primary" onClick={() => setOpen(false)}>{item.label}</Link>
        ))}
        <Link href="/my-account" className="block w-full text-center bg-primary text-white py-2.5 rounded-btn font-semibold mt-2">Login / Register</Link>
      </div>}
    </header>
  )
}
