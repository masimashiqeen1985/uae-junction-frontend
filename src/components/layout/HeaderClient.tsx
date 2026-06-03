'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import {
  ShoppingCart, Search, Menu, ChevronDown, Wallet,
  Ticket, Waves, Tent, Ship, Sparkles, Building2, Plane, MapPin, Compass, Moon, Star,
} from 'lucide-react'
import { AuthDropdown } from '@/components/auth/AuthDropdown'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import type { NavItem, NavChild } from './nav-types'


export type { NavItem, NavChild }


type Props = {
  nav: NavItem[]
  providers: { google: boolean; facebook: boolean }
  authConfigured: boolean
}


// Map a child label to a travel icon (keyword based) for the mega-menu.
function iconFor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('water')) return Waves
  if (l.includes('theme')) return Ticket
  if (l.includes('desert') || l.includes('safari')) return Tent
  if (l.includes('cruise') || l.includes('dhow')) return Ship
  if (l.includes('experience')) return Sparkles
  if (l.includes('hotel')) return Building2
  if (l.includes('flight')) return Plane
  if (l.includes('city') || l.includes('tour')) return MapPin
  if (l.includes('umrah')) return Moon
  if (l.includes('promo') || l.includes('offer')) return Star
  return Compass
}


export function HeaderClient({ nav, providers, authConfigured }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const isHome = pathname === '/'
  const { scrollY } = useScroll()


  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    // Hide on scroll-down past the hero, reveal on scroll-up. Never hide near top.
    if (y > 160 && y > prev) setHidden(true)
    else setHidden(false)
  })


  const transparent = isHome && !scrolled
  const textColor = transparent ? 'text-white' : 'text-neutral-700'


  return (
    <>
      <motion.header
