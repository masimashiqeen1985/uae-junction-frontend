'use client'
import { useEffect, useRef } from 'react'
import './vibrant-home.css'
import { SocialIcons } from '@/components/layout/SocialIcons'
import { HeroSearch, type HeroCountry } from '@/components/home/HeroSearch'

/**
 * Vibrant Junction — full homepage.
 * Faithful React port of the approved homepage-EDITS.html. All styling is scoped
 * under `.vibrant-home` (see vibrant-home.css). Demo interactivity (search tabs,
 * wishlist hearts, enquiry tabs, reveal-on-scroll, toasts) is ported into the
 * effect below. Product/listing data is currently static and structured so each
 * card array can be swapped for a WPGraphQL source in the CMS-binding phase.
 */
export function VibrantHome({ destinations = [] }: { destinations?: HeroCountry[] }) {
  const root = useRef<HTMLDivElement>(null)
  const catRowRef = useRef<HTMLDivElement>(null)

  // Scroll to the category slider when arriving with the #explore-book hash
  // (e.g. clicking "Explore & Book" in the header from another page).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#explore-book') return
    const el = document.getElementById('explore-book')
    if (!el) return
    const t = window.setTimeout(
      () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      120,
    )
    return () => window.clearTimeout(t)
  }, [])


  useEffect(() => {
    const r = root.current
    if (!r) return
    const q = (s: string): HTMLElement[] => Array.from(r.querySelectorAll<HTMLElement>(s))

    // reveal on scroll
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    q('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el) })

    // toast helper
    let tEl: HTMLDivElement | null = null
    let tTimer: ReturnType<typeof setTimeout> | undefined
    const toast = (msg: string) => {
      if (!tEl) {
        tEl = document.createElement('div')
        tEl.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#0d1b2a;color:#fff;padding:13px 22px;border-radius:14px;font-weight:600;font-size:.92rem;box-shadow:0 12px 34px rgba(0,0,0,.28);z-index:9999;opacity:0;transition:opacity .25s,transform .25s;max-width:88vw;text-align:center'
        document.body.appendChild(tEl)
      }
      tEl.textContent = msg
      requestAnimationFrame(() => { if (tEl) { tEl.style.opacity = '1'; tEl.style.transform = 'translateX(-50%) translateY(0)' } })
      clearTimeout(tTimer)
      tTimer = setTimeout(() => { if (tEl) { tEl.style.opacity = '0'; tEl.style.transform = 'translateX(-50%) translateY(20px)' } }, 2600)
    }

    // wishlist hearts
    let saved = 0
    q('.heart').forEach((h) => h.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation()
      const on = h.classList.toggle('saved')
      h.textContent = on ? '♥' : '♡'; h.style.color = on ? '#ff5a5f' : ''
      saved += on ? 1 : -1
      toast(on ? '❤ Saved to your wishlist (' + saved + ')' : 'Removed from wishlist')
    }))

    // enquiry tabs
    // Hotels & Flights enquiry: functional tabs + real submit (WhatsApp / sales email)
    const SALES_EMAIL = 'sales@theuaejunction.com'
    const WHATSAPP = '971585898221'
    const enqForm = r.querySelector<HTMLFormElement>('.enq-form')
    const enqTabs = Array.from(r.querySelectorAll<HTMLButtonElement>('.enq-tab'))
    let enqType = 'Hotel'
    const todayISO = new Date().toISOString().slice(0, 10)
    enqForm?.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach((d) => { d.min = todayISO })
    enqTabs.forEach((t) => t.addEventListener('click', () => {
      enqTabs.forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false') })
      t.classList.add('active'); t.setAttribute('aria-pressed', 'true')
      enqType = (t.dataset.type || (t.textContent || 'Hotel').replace(/[^A-Za-z]/g, '')).trim() || 'Hotel'
      const di = enqForm?.querySelector<HTMLInputElement>('input[name="destination"]')
      if (di) di.placeholder = enqType === 'Flight' ? 'Dubai → Istanbul' : 'Dubai, Istanbul…'
    }))
    if (enqForm) enqForm.addEventListener('submit', (ev) => {
      ev.preventDefault()
      const fq = (n: string) => enqForm.querySelector<HTMLInputElement | HTMLSelectElement>('[name="' + n + '"]')
      const destEl = fq('destination') as HTMLInputElement | null
      const travEl = fq('travellers') as HTMLSelectElement | null
      const inEl = fq('checkin') as HTMLInputElement | null
      const outEl = fq('checkout') as HTMLInputElement | null
      const contactEl = fq('contact') as HTMLInputElement | null
      const destination = destEl?.value.trim() || ''
      const contact = contactEl?.value.trim() || ''
      if (!destination) { toast('Please tell us your destination.'); destEl?.focus(); return }
      if (!contact) { toast('Add a WhatsApp number or email so we can send your quote.'); contactEl?.focus(); return }
      const fmt = (v?: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
      const isFlight = enqType === 'Flight'
      const lines = [
        'Hello UAE Junction — I’d like a quote.',
        'Type: ' + enqType,
        (isFlight ? 'Route: ' : 'Destination: ') + destination,
        'Travellers: ' + (travEl?.value || '—'),
        (isFlight ? 'Depart: ' : 'Check-in: ') + fmt(inEl?.value),
        (isFlight ? 'Return: ' : 'Check-out: ') + fmt(outEl?.value),
        'Contact: ' + contact,
        '',
        '(I understand hotels & flights are hand-priced, and I’ll earn 2.5% cashback once booked.)',
      ]
      const body = lines.join('\n')
      const isEmail = /^[^\s\u0040]+\u0040[^\s\u0040]+\.[^\s\u0040]+$/.test(contact)
      if (isEmail) {
        const subject = encodeURIComponent('Quote request — ' + enqType + ' — ' + destination)
        window.open('mailto:' + SALES_EMAIL + '?subject=' + subject + '&body=' + encodeURIComponent(body), '_blank', 'noopener')
      } else {
        window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(body), '_blank', 'noopener')
      }
      toast('✅ Opening your pre-filled enquiry — just hit send!')
      enqForm.reset()
      enqType = 'Hotel'
      enqTabs.forEach((x, i) => { x.classList.toggle('active', i === 0); x.setAttribute('aria-pressed', i === 0 ? 'true' : 'false') })
      const di2 = enqForm.querySelector<HTMLInputElement>('input[name="destination"]')
      if (di2) di2.placeholder = 'Dubai, Istanbul…'
    })

    // placeholder links -> demo toast
    q('a.cat[href="#"], a.card[href="#"], a.show-card[href="#"], a.dest[href="#"], a.country[href="#"]').forEach((a) =>
      a.addEventListener('click', (e) => { e.preventDefault(); const t = a.querySelector('.t,h3'); toast('Opening ' + (t ? (t.textContent || '').trim() : 'page') + ' … (demo)') })
    )

    // generic in-page demo "#" buttons (card CTAs etc.) — nav CTAs now live in the global header
    q('a.btn[href="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const label = (a.textContent || '').trim()
        e.preventDefault()
        toast(label + ' … (demo)')
      })
    )

    // forms -> prevent submit + toast
    Array.from(r.querySelectorAll<HTMLFormElement>('form:not(.enq-form)')).forEach((fm) =>
      fm.addEventListener('submit', (e) => { e.preventDefault(); toast('✅ Thanks! We will be in touch shortly. (demo)'); if (fm.reset) fm.reset() })
    )

    return () => { io.disconnect(); if (tEl && tEl.parentNode) tEl.parentNode.removeChild(tEl); clearTimeout(tTimer) }
  }, [])

  return (
    <div className="vibrant-home" ref={root}>
      {/* Navigation is provided by the global SiteChrome header on every route */}
      <header className="hero">
      <div className="hero-bg" aria-hidden="true"><div className="blob b1"></div><div className="blob b2"></div></div>
      <div className="wrap">
      <div className="hero-top">
      <span className="pill">💸 Flat 2.5% cashback — every booking, no exceptions</span>
      </div>
      <h1>Every UAE experience, in one place.</h1>
      <p className="sub">From theme parks and desert safaris to dhow cruises, city tours and far beyond — book in seconds, get instant tickets, and earn a flat <b>2.5% cashback on every single booking</b>.</p>
      <HeroSearch destinations={destinations} />
      <div className="hero-trust">
      <span><span className="stars">★★★★★</span> 4.9 / 5 · 12,400 reviews</span>
      <span>✅ Instant confirmation</span>
      </div>
      </div>
      </header>
      <div className="wrap cats" id="explore-book" style={{ scrollMarginTop: 96 }}>
        <div className="cat-scroll-wrap">
          <div className="cat-row" ref={catRowRef} role="group" aria-label="Browse categories">
            <a className="cat" href="/theme-parks" aria-label="Theme Parks, 28 attractions"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/06/SEA-FERRARI-YAS-WARNER-BROS.jpg?w=500&ssl=1" alt="Theme Parks" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Theme Parks</span><span className="c">28 attractions</span></span></span></a>
            <a className="cat" href="https://www.theuaejunction.cloud/desert-safari" aria-label="Desert Safari, 41 tours"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/high-angle-view-off-road-vehicle-desert.jpg?w=500&ssl=1" alt="Desert Safari" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Desert Safari</span><span className="c">41 tours</span></span></span></a>
            <a className="cat" href="https://www.theuaejunction.cloud/dhow-cruise" aria-label="Dhow Cruise, 19 cruises"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/PREMIUM-DHOW-CRUISE-CREEK-DEAL-768x1024-1.jpg?w=500&ssl=1" alt="Dhow Cruise" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Dhow Cruise</span><span className="c">19 cruises</span></span></span></a>
            <a className="cat" href="https://www.theuaejunction.cloud/water-parks" aria-label="Water Parks, 12 parks"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/1-14.jpg?w=500&ssl=1" alt="Water Parks" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Water Parks</span><span className="c">12 parks</span></span></span></a>
            <a className="cat" href="/uae-city-tours" aria-label="City Tours, 34 tours"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/portrait-friends-visiting-luxurious-city-dubai.jpg?w=500&ssl=1" alt="City Tours" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">City Tours</span><span className="c">34 tours</span></span></span></a>
            <a className="cat" href="#staycations" aria-label="Staycations, 48 deals"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/Dubai-Fountain-1.jpg?w=500&ssl=1" alt="Staycations" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Staycations</span><span className="c">48 deals</span></span></span></a>
            <a className="cat" href="#packages" aria-label="Holiday Packages, 120+ trips"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/young-beautiful-hipster-couple-love-tropical-beach-taking-selfie-photo-smartphone-sunglasses-stylish-outfit-summer-vacation-having-fun-smiling-happy-colorful-positive-emotion.jpg?w=500&ssl=1" alt="Holiday Packages" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Holiday Packages</span><span className="c">120+ trips</span></span></span></a>
            <a className="cat" href="#enquiry" aria-label="Hotels, Enquire"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/couple-receptionist-counter-hotel-young-couple-checking-hotel.jpg?w=500&ssl=1" alt="Hotels" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Hotels</span><span className="c">Enquire</span></span></span></a>
            <a className="cat" href="#enquiry" aria-label="Flights, Enquire"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/9782-1.jpg?w=500&ssl=1" alt="Flights" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Flights</span><span className="c">Enquire</span></span></span></a>
            <a className="cat" href="/umrah-packages" aria-label="Umrah, Packages"><span className="cat-inner"><img className="cat-img" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/08/1-21.jpg?w=500&ssl=1" alt="Umrah" loading="lazy" decoding="async" width="184" height="230" /><span className="cat-scrim" aria-hidden="true"></span><span className="cat-meta"><span className="t">Umrah</span><span className="c">Packages</span></span></span></a>
          </div>
        </div>
      </div>
      <section id="trending"><div className="wrap">
      <div className="sec-head reveal">
      <div><span className="eyebrow">Popular right now</span><h2>Trending in Dubai 🔥</h2><p>Lowest-price guarantee · every booking earns 2.5% back</p></div>
      <a href="#">See all 240 →</a>
      </div>
      <div className="cards">
      <a className="card reveal" href="https://www.theuaejunction.cloud/product/yas-island-4-theme-park-tickets-combo-pass"><div className="imgwrap"><img alt="Yas Island 4 Theme Park Tickets Combo Pass" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/06/SEA-FERRARI-YAS-WARNER-BROS.jpg?w=700&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Theme Parks</div><h3>Yas Island 4 Theme Park Combo Pass</h3><div className="priceline"><div className="price"><small>per adult</small><span className="was">AED 675</span> <strong>AED 589</strong></div><span className="cashtag">+AED 14.73 back</span></div></div></a>
      <a className="card reveal" href="https://www.theuaejunction.cloud/product/ferrari-world-seaworld-abu-dhabi-combo"><div className="imgwrap"><img alt="Ferrari World Plus SeaWorld Abu Dhabi Combo" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/05/Ferrari-World-SeaWorld-Abu-Dhabi-Combo-Package.webp?w=700&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Theme Parks</div><h3>Ferrari World + SeaWorld Abu Dhabi Combo</h3><div className="priceline"><div className="price"><small>per adult</small><span className="was">AED 449</span> <strong>AED 419</strong></div><span className="cashtag">+AED 10.48 back</span></div></div></a>
      <a className="card reveal" href="https://www.theuaejunction.cloud/product/dubai-aquarium-underwater-zoo-ocean-wonders"><div className="imgwrap"><img alt="Dubai Aquarium and Underwater Zoo" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/Dubai-Aquarium-Under-Water-Zoo-1.jpg?w=700&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Experiences</div><h3>Dubai Aquarium &amp; Underwater Zoo</h3><div className="priceline"><div className="price"><small>per adult</small><span className="was">AED 169</span> <strong>AED 159</strong></div><span className="cashtag">+AED 3.98 back</span></div></div></a>
      <a className="card reveal" href="https://www.theuaejunction.cloud/product/global-village-dubai"><div className="imgwrap"><img alt="Global Village Dubai" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/Global-Village-1.webp?w=700&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Experiences</div><h3>Global Village Dubai Entry</h3><div className="priceline"><div className="price"><small>per adult</small><span className="was">AED 39</span> <strong>AED 35</strong></div><span className="cashtag">+AED 0.88 back</span></div></div></a>
      </div>
      </div></section>
      <section className="how"><div className="wrap">
      <div className="sec-head reveal"><div><span className="eyebrow">No tiers, no catch</span><h2>How your 2.5% cashback works</h2><p>Real money back on every booking — not points you&apos;ll forget about.</p></div></div>
      <div className="how-grid">
      <div className="step reveal"><div className="n">1</div><h4>Book anything</h4><p>Tours, tickets and experiences across the UAE — all in one cart with one simple checkout.</p></div>
      <div className="step reveal"><div className="n">2</div><h4>Earn 2.5% instantly</h4><p>Cashback lands in your Junction Wallet the moment your booking is confirmed. Every dirham counts.</p></div>
      <div className="step reveal"><div className="n">3</div><h4>Spend it your way</h4><p>Use your balance against the next booking, or withdraw it. No expiry, no minimum, no fine print.</p></div>
      </div>
      </div></section>
      <section id="staycations"><div className="wrap">
      <div className="sec-head reveal"><div><span className="eyebrow">Stay close, feel away</span><h2>UAE Staycations 🏖️</h2><p>Resort nights, breakfast &amp; perks bundled — 2.5% cashback included.</p></div><a href="#">See all 48 →</a></div>
      <div className="cards">
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Palm Jumeirah beach resort" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/couple-receptionist-counter-hotel-young-couple-checking-hotel.jpg?w=900&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Dubai · 1 Night</div><h3>Palm Beach Resort + Breakfast</h3><div className="priceline"><div className="price"><small>per room</small><span className="was">AED 740</span> <strong>AED 590</strong></div><span className="cashtag">+AED 14.75 back</span></div></div></a>
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Desert resort pool at dusk" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/young-beautiful-hipster-couple-love-tropical-beach-taking-selfie-photo-smartphone-sunglasses-stylish-outfit-summer-vacation-having-fun-smiling-happy-colorful-positive-emotion.jpg?w=900&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">RAK · 1 Night</div><h3>Desert Spa Escape + Half Board</h3><div className="priceline"><div className="price"><small>per room</small><strong>AED 820</strong></div><span className="cashtag">+AED 20.5 back</span></div></div></a>
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Abu Dhabi waterfront hotel" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/portrait-friends-visiting-luxurious-city-dubai.jpg?w=900&ssl=1" /><div className="badges"><span className="pill pill-hot">Family</span></div><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Abu Dhabi · 2 Nights</div><h3>Corniche Family Stay + Park Tickets</h3><div className="priceline"><div className="price"><small>package</small><strong>AED 1,450</strong></div><span className="cashtag">+AED 36.25 back</span></div></div></a>
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Boutique hotel courtyard Al Fahidi" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/04/pattaya-park-major-tourist-attractions-city.jpg?w=900&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Dubai · 1 Night</div><h3>Old-Town Boutique + Late Checkout</h3><div className="priceline"><div className="price"><small>per room</small><strong>AED 510</strong></div><span className="cashtag">+AED 12.75 back</span></div></div></a>
      </div>
      </div></section>
      <section id="packages"><div className="wrap">
      <div className="sec-head reveal"><div><span className="eyebrow">Everything sorted</span><h2>Holiday Packages 🧳</h2><p>Flights, stay &amp; experiences in one price — book online or enquire for a tailored quote.</p></div><a href="#">See all 120 →</a></div>
      <div className="cards">
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Maldives overwater villas" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/05/Group-146-1.jpg?w=900&ssl=1" /><div className="badges"><span className="pill pill-hot">Bestseller</span></div><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Maldives · 4N / 5D</div><h3>Overwater Villa Honeymoon</h3><div className="priceline"><div className="price"><small>per person</small><strong>AED 5,900</strong></div><span className="cashtag">+AED 147.5 back</span></div></div></a>
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Istanbul skyline with mosques" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/05/Group-148-1.jpg?w=900&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Türkiye · 5N / 6D</div><h3>Istanbul &amp; Cappadocia Explorer</h3><div className="priceline"><div className="price"><small>per person</small><strong>AED 3,200</strong></div><span className="cashtag">+AED 80 back</span></div></div></a>
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Georgia mountains and old town" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/05/Group-147-1.jpg?w=900&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Georgia · 4N / 5D</div><h3>Tbilisi &amp; Kazbegi Getaway</h3><div className="priceline"><div className="price"><small>per person</small><strong>AED 2,450</strong></div><span className="cashtag">+AED 61.25 back</span></div></div></a>
      <a className="card reveal" href="#"><div className="imgwrap"><img alt="Thailand beach and longtail boats" src="https://i0.wp.com/theuaejunction.com/wp-content/uploads/2025/05/Group-144-1.jpg?w=900&ssl=1" /><div className="heart">♡</div></div>
      <div className="body"><div className="cat-tag">Thailand · 6N / 7D</div><h3>Phuket &amp; Krabi Island Hopper</h3><div className="priceline"><div className="price"><small>per person</small><strong>AED 4,100</strong></div><span className="cashtag">+AED 102.5 back</span></div></div></a>
      </div>
      </div></section>
      <section><div className="wrap">
      <div className="sec-head reveal"><div><span className="eyebrow">Where to next</span><h2>Top destinations across the Emirates</h2><p>Seven emirates, one platform — pick a city and we&apos;ll do the rest.</p></div><a href="https://www.theuaejunction.cloud/destinations" aria-label="View all destinations">All destinations →</a></div>
      <div className="dest-grid">
      <a className="dest reveal" href="https://www.theuaejunction.cloud/destinations/dubai"><img alt="Dubai skyline with the Burj Khalifa" src="/destinations/dubai.webp" width="760" height="1013" loading="lazy" decoding="async" /><div className="b"><h3>Dubai</h3><div className="c">840+ things to do</div></div></a>
      <a className="dest reveal" href="https://www.theuaejunction.cloud/destinations/abu-dhabi"><img alt="Sheikh Zayed Grand Mosque in Abu Dhabi" src="/destinations/abu-dhabi.webp" width="760" height="1013" loading="lazy" decoding="async" /><div className="b"><h3>Abu Dhabi</h3><div className="c">320+ things to do</div></div></a>
      <a className="dest reveal" href="https://www.theuaejunction.cloud/destinations/ras-al-khaimah"><img alt="Jebel Jais mountains in Ras Al Khaimah" src="/destinations/ras-al-khaimah.webp" width="760" height="1013" loading="lazy" decoding="async" /><div className="b"><h3>Ras Al Khaimah</h3><div className="c">110+ things to do</div></div></a>
      <a className="dest reveal" href="https://www.theuaejunction.cloud/destinations/sharjah"><img alt="Al Noor Mosque in Sharjah" src="/destinations/sharjah.webp" width="760" height="1013" loading="lazy" decoding="async" /><div className="b"><h3>Sharjah</h3><div className="c">90+ things to do</div></div></a>
      </div>
      </div></section>
      <section id="countries"><div className="wrap">
      <div className="sec-head reveal"><div><span className="eyebrow">Beyond the UAE</span><h2>Explore 12 countries 🌍</h2><p>Each destination opens its own hub — Things to do, Theme Parks, and Taxi &amp; Train bookings, just like the UAE.</p></div><a href="#">View all destinations →</a></div>
      <div className="country-grid">
      <a className="country reveal" href="#"><img alt="Saudi Arabia" src="https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Saudi Arabia</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Qatar" src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Qatar</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Oman" src="https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Oman</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Bahrain" src="https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Bahrain</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Türkiye" src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Türkiye</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Egypt" src="https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Egypt</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Thailand" src="https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Thailand</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Malaysia" src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Malaysia</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Singapore" src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Singapore</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Maldives" src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Maldives</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Georgia" src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Georgia</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      <a className="country reveal" href="#"><img alt="Azerbaijan" src="https://images.unsplash.com/photo-1601751818941-571144562ff8?q=80&w=600&auto=format&fit=crop" /><div className="b"><h3>Azerbaijan</h3><div className="links">Things to do · Theme Parks · Taxi &amp; Train</div></div></a>
      </div>
      </div></section>
      <section id="enquiry"><div className="wrap">
      <div className="enquiry reveal">
      <div>
      <span className="pill pill-cash">Tailored for you</span>
      <h2>Hotels &amp; Flights, Hand-Priced by Our UAE Travel Desk</h2>
      <p>Tell us where and when. Our UAE travel desk sends a hand-priced quote — and you still earn 2.5% cashback once booked.</p>
      <ul className="enq-points">
      <li>✓ Best regional &amp; international fares</li>
      <li>✓ 2,100+ hotels, negotiated rates</li>
      <li>✓ One desk for the whole itinerary</li>
      </ul>
      </div>
      <form className="enq-form" noValidate aria-label="Hotels and flights quote request">
      <div className="enq-tabs" role="group" aria-label="What would you like a quote for?">
      <button type="button" className="enq-tab active" data-type="Hotel" aria-pressed="true">🏨 Hotel</button>
      <button type="button" className="enq-tab" data-type="Flight" aria-pressed="false">✈️ Flight</button>
      <button type="button" className="enq-tab" data-type="Both" aria-pressed="false">🧳 Both</button>
      </div>
      <div className="enq-row">
      <label>Destination<input name="destination" type="text" placeholder="Dubai, Istanbul…" required /></label>
      <label>Travellers
      <select name="travellers" defaultValue="2 adults">
      <option>1 adult</option>
      <option>2 adults</option>
      <option>3 adults</option>
      <option>4 adults</option>
      <option>2 adults + children</option>
      <option>Family / group</option>
      </select>
      </label>
      </div>
      <div className="enq-row">
      <label>Check-in / Depart<input name="checkin" type="date" /></label>
      <label>Check-out / Return<input name="checkout" type="date" /></label>
      </div>
      <label className="enq-full">Your WhatsApp or email<input name="contact" type="text" inputMode="email" placeholder="+971 50… or you@email.com" required /></label>
      <button type="submit" className="btn btn-grad enq-submit">Request my quote →</button>
      <small className="enq-note">No payment now · typical reply within 2 hours</small>
      </form>
      </div>
      </div></section>
      <section><div className="wrap">
      <div className="sec-head reveal"><div><span className="eyebrow">Loved by travellers</span><h2>What our travellers say</h2><p>Rated 4.9 / 5 across verified bookings.</p></div></div>
      <div className="reviews">
      <div className="review reveal"><div className="stars">★★★★★</div><p>“Booked the desert safari and a dhow dinner in two minutes. Cashback hit my wallet instantly — used it on the kids&apos; Aquaventure tickets.”</p><div className="who"><div className="av">SA</div><div><b>Sara A.</b><small>Riyadh → Dubai</small></div></div></div>
      <div className="review reveal"><div className="stars">★★★★★</div><p>“Finally one place for all the tickets and tours. The 2.5% back is real money, not points — and the joining bonus paid for our coffee on day one.”</p><div className="who"><div className="av">JM</div><div><b>James M.</b><small>London → Abu Dhabi</small></div></div></div>
      <div className="review reveal"><div className="stars">★★★★★</div><p>“Booking was instant and the cashback landed exactly as promised. Re-booked a city tour same day with zero hassle. This is now my default for the UAE.”</p><div className="who"><div className="av">PR</div><div><b>Priya R.</b><small>Mumbai → Sharjah</small></div></div></div>
      <div className="review reveal"><div className="stars">★★★★★</div><p>“We booked our staff outing on the Dhow Cruise and it was a memorable evening. UAE Junction took care of everything — smooth arrangements, a delicious dinner and lively entertainment. We even received return gifts. The whole team had a fantastic time!”</p><div className="who"><div className="av">MR</div><div><b>Mrs. Rangrey</b><small>Dubai</small></div></div></div>
      <div className="review reveal"><div className="stars">★★★★★</div><p>“We celebrated our anniversary with a Desert Safari and it was unforgettable. From thrilling dune bashing to a stunning sunset, everything was perfectly arranged. Thank you, UAE Junction, for making it truly magical!”</p><div className="who"><div className="av">MA</div><div><b>Mr. Muhammad Asad</b><small>Dubai</small></div></div></div>
      <div className="review reveal"><div className="stars">★★★★★</div><p>“I travelled from Oman and booked Ferrari World, a Dhow Cruise, Global Village, IMG Worlds and Dubai Safari — all through UAE Junction. Best rates, a seamless experience and everything well organised. Highly recommend!”</p><div className="who"><div className="av">AN</div><div><b>Mr. Anupam</b><small>Oman → Dubai</small></div></div></div>
      <div className="review reveal"><div className="stars">★★★★★</div><p>“Booking my flight with UAE Junction was the best decision. I got a great deal from Abu Dhabi to India and the customer service was exceptional — very responsive when I needed to adjust my booking. Highly recommended!”</p><div className="who"><div className="av">AU</div><div><b>Mr. Austin</b><small>Abu Dhabi → India</small></div></div></div>
      </div>
      </div></section>
      <section><div className="wrap"><div className="news reveal">
      <h2>Deals worth opening</h2>
      <p>Join 40,000 travellers getting the UAE&apos;s best experience drops — plus an extra AED 25 cashback on your first booking.</p>
      <form><input type="email" placeholder="you@email.com" aria-label="Email" /><button className="btn btn-grad">Get deals →</button></form>
      </div></div></section>
      <footer><div className="wrap">
      <div className="foot-grid">
      <div className="foot-brand">
      <svg viewBox="0 0 250 60" style={{height:'48px',width:'auto',display:'block'}} role="img" aria-label="The UAE Junction"><path d="M10 52 V24 a16 16 0 0 1 32 0 V52" fill="none" stroke="#7FB0AA" strokeWidth="6" strokeLinecap="round"/><rect x="7" y="22" width="6.5" height="30" rx="3.25" fill="#E0832B"/><rect x="31" y="36" width="13" height="14" rx="3" fill="#9A82C0"/><text x="60" y="25" fontFamily="Cinzel,serif" fontWeight="600" fontSize="18" letterSpacing="2.5" fill="#ffffff">THE UAE</text><text x="60" y="48" fontFamily="Cinzel,serif" fontWeight="600" fontSize="18" letterSpacing="2.5" fill="#ffffff">JUNCTION</text></svg>
      <p style={{maxWidth:'32ch',margin:'14px 0'}}>The UAE&apos;s one-stop platform for tours, tickets and experiences — with 2.5% cashback on everything.</p>
      <div className="foot-pay" aria-label="Accepted payment methods"><img className="pay-logo" src="/pay/mastercard.svg" alt="Mastercard" width="46" height="30" loading="lazy" /><img className="pay-logo" src="/pay/visa.svg" alt="VISA" width="46" height="30" loading="lazy" /><img className="pay-logo" src="/pay/stripe.svg" alt="Stripe" width="46" height="30" loading="lazy" /><img className="pay-logo" src="/pay/tabby.svg" alt="Tabby" width="46" height="30" loading="lazy" /><img className="pay-logo" src="/pay/paypal.svg" alt="PayPal" width="46" height="30" loading="lazy" /></div><div className="foot-social" style={{marginTop:'18px'}}><p style={{fontSize:'.72rem',letterSpacing:'.12em',textTransform:'uppercase',opacity:.7,margin:'0 0 10px'}}>Follow us</p><SocialIcons links={[{platform:'Instagram',url:'https://www.instagram.com/theuaejunction_travel'},{platform:'Facebook',url:'https://www.facebook.com/share/1DBbzt4W8s/'},{platform:'TikTok',url:'https://www.tiktok.com/@theuaejunction2'},{platform:'YouTube',url:'https://youtube.com/@theuaejunction'},{platform:'Pinterest',url:'https://www.pinterest.com/theuaejunction/'}]} /></div>
      </div>
      <div><h4>Explore</h4><ul><li><a href="https://www.theuaejunction.cloud/theme-parks">Theme Parks</a></li><li><a href="https://www.theuaejunction.cloud/desert-safari">Desert Safari</a></li><li><a href="#staycations">Staycations</a></li><li><a href="#packages">Holiday Packages</a></li><li><a href="#enquiry">Hotels &amp; Flights</a></li><li><a href="#countries">12 Destinations</a></li><li><a href="https://www.theuaejunction.cloud/umrah-packages">Umrah Packages</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="https://www.theuaejunction.cloud/about-us">About us</a></li><li><a href="https://www.theuaejunction.cloud/careers">Careers</a></li><li><a href="https://www.theuaejunction.cloud/group-corporate-bookings">Group &amp; Corporate</a></li><li><a href="https://www.theuaejunction.cloud/promotions">Promotions</a></li><li><a href="https://www.theuaejunction.cloud/blogs">Blog</a></li><li><a href="https://www.theuaejunction.cloud/contact-us">Contact</a></li></ul></div>
      <div><h4>Support</h4><ul><li><a href="https://www.theuaejunction.cloud/contact-us">Help centre</a></li><li><a href="https://www.theuaejunction.cloud/rewards-policy">Rewards policy</a></li><li><a href="https://www.theuaejunction.cloud/privacy-policy">Privacy policy</a></li><li><a href="https://www.theuaejunction.cloud/terms-and-conditions">Terms &amp; conditions</a></li><li><a href="https://www.theuaejunction.cloud/terms-and-conditions">Cancellation</a></li></ul></div>
      </div>
      <div className="foot-bottom" style={{justifyContent:'center',textAlign:'center'}}><span>Copyright © 2026 The UAE Junction, Powered by Arabian Junction FZC LLC All rights reserved.</span></div>
      </div></footer>
    </div>
  )
}
