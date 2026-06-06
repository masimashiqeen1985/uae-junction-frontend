// src/app/careers/page.tsx
// On-model Careers page for The UAE Junction. Uses the global Vibrant Junction
// design-system primitives from globals.css (.container-xl, .bg-brand, .eyebrow,
// .uj-btn-grad, .uj-card, .pill-cash, .bg-sunset/.bg-lagoon) and @theme tokens
// (text-ink, text-primary, font-display, rounded-card, shadow-card).
// Header + footer come from the global layout (SiteChrome) — NOT repeated here.
// Organization/WebSite JSON-LD is already emitted by layout.tsx — only JobPosting added here.

import type { Metadata } from 'next'
import CareersInteractive from './CareersInteractive'

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join The UAE Junction — explore remote, full-time careers in design, marketing, SEO and technology, or send a speculative application. Where passion meets purpose.',
  alternates: { canonical: '/careers' },
}
export const revalidate = 3600

const roles = [
  {
    title: 'Graphic Designer',
    summary:
      'We are seeking a highly creative and detail-oriented Graphic Designer to join our marketing and communications team. This role involves translating complex ideas and marketing goals into visually compelling designs that align with our brand identity, creating materials that capture attention, communicate value, and elevate our presence across all digital and print platforms.',
    responsibilities: [
      'Conceptualize, design, and produce high-quality visual content for website assets, social media campaigns, email marketing, presentations, and print collateral (brochures, posters).',
      "Maintain and evolve the company's visual brand standards, ensuring consistency across all outgoing materials.",
      'Collaborate closely with the marketing, sales, and development teams to deliver effective design solutions on time.',
      'Manage multiple design projects simultaneously, from initial concept to final delivery.',
      'Stay up-to-date with industry trends, design software, and emerging visual communication techniques.',
    ],
    qualifications: [
      'Proven experience as a Graphic Designer or in a similar creative role.',
      'Exceptional proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign).',
      'A strong portfolio demonstrating versatility, creativity, and a solid understanding of design principles (typography, color theory, layout).',
      'Excellent communication and presentation skills to articulate design decisions.',
      'Experience with motion graphics or video editing is a plus.',
    ],
  },
  {
    title: 'Social Media Sales & Marketing',
    summary:
      'We are looking for a dynamic and results-focused Social Media Sales & Marketing Specialist to manage our social media presence across all relevant platforms. This role is a hybrid of creative marketing and direct sales, requiring the specialist to build brand awareness and engagement as well as generate qualified leads and drive direct sales conversions through social channels.',
    responsibilities: [
      'Design and execute comprehensive social media strategies to increase brand visibility, audience engagement, and follower growth.',
      'Manage day-to-day posting, scheduling, and community management across platforms (e.g., Instagram, Facebook, LinkedIn, TikTok).',
      'Create, curate, and manage high-quality, original content (text, image, video) that resonates with target audiences.',
      'Develop and oversee paid social media advertising campaigns, optimizing for ROI and sales conversions.',
      'Actively monitor social channels for sales opportunities, engage with potential leads, and hand off qualified prospects to the sales team.',
      'Track, measure, and report on social media performance metrics and campaign effectiveness.',
    ],
    qualifications: [
      'Demonstrable experience managing business accounts on major social media platforms.',
      'Proven track record of driving measurable business results (leads, sales, traffic) through social media campaigns.',
      'Expertise in using social media scheduling, monitoring, and analytics tools.',
      'Strong understanding of social media advertising platforms (e.g., Facebook Ads Manager).',
      'Exceptional copywriting, editing, and communication skills, with an eye for compelling visual content.',
    ],
  },
  {
    title: 'SEO Specialist',
    summary:
      'We require a meticulous and data-driven SEO Specialist to enhance our organic search visibility and drive qualified traffic to our digital properties. You will develop and execute a comprehensive SEO strategy, perform in-depth analysis, and implement tactics to improve search engine rankings and overall performance.',
    responsibilities: [
      'Develop and implement successful, long-term SEO strategies, covering both on-page and off-page optimization.',
      'Conduct thorough keyword research, competitive analysis, and technical SEO audits of our websites.',
      'Monitor, analyze, and report on SEO performance using tools like Google Analytics, Google Search Console, SEMrush, and others.',
      'Collaborate with the content team to ensure all website copy and landing pages are fully optimized for search engines.',
      'Manage link-building campaigns and identify high-quality backlink opportunities.',
      'Stay current with algorithmic updates, SEO best practices, and search engine guidelines.',
    ],
    qualifications: [
      'Proven professional experience as an SEO Specialist or managing significant SEO projects.',
      'Expert-level knowledge of technical SEO elements (site structure, indexing, crawl budget, Core Web Vitals).',
      'Deep familiarity with key SEO and analytics tools.',
      'Strong analytical skills with the ability to interpret data and translate it into actionable strategies.',
      'Excellent written and verbal communication skills to explain complex SEO concepts simply.',
    ],
  },
  {
    title: 'Junior Web & App Developer',
    summary:
      'We are looking for an enthusiastic and motivated Junior Web/App Developer eager to kickstart their career by contributing to the design, development, and maintenance of our digital products. This is an excellent opportunity to work alongside senior developers, gain hands-on experience, and learn best practices in a fast-paced technology environment.',
    responsibilities: [
      'Assist in writing clean, scalable, and well-documented code for new features and updates on our company website and mobile applications.',
      'Participate in all stages of the software development lifecycle, including planning, testing, and deployment.',
      'Debug, troubleshoot, and resolve software defects and technical issues reported by users or QA.',
      'Ensure the technical feasibility of UI/UX designs and optimize applications for maximum speed and scalability.',
      'Maintain awareness of current and emerging technologies and programming practices.',
    ],
    qualifications: [
      "Bachelor's degree in computer science, IT, or a related field, OR equivalent practical experience / coding bootcamp completion.",
      'Foundational knowledge of front-end technologies (HTML5, CSS3, JavaScript) and/or back-end languages (e.g., Python, Java, PHP, Node.js).',
      'Familiarity with at least one modern web framework (e.g., React, Angular, Vue, Django, Spring).',
      'Understanding of version control systems, particularly Git.',
      'A logical, problem-solving mindset and a genuine desire to learn and take on new challenges.',
    ],
  },
]

const jobsLd = {
  '@context': 'https://schema.org',
  '@graph': roles.map((r) => ({
    '@type': 'JobPosting',
    title: r.title,
    description: r.summary,
    employmentType: 'FULL_TIME',
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: { '@type': 'Country', name: 'United Arab Emirates' },
    hiringOrganization: { '@type': 'Organization', name: 'The UAE Junction', sameAs: 'https://www.theuaejunction.cloud' },
    directApply: true,
  })),
}

const pillars = [
  { icon: '💡', cls: 'bg-brand', t: 'Innovative Mindset', d: 'We encourage creativity, new ideas, and forward-thinking. Every team member plays an important role in shaping our services and elevating the travel experience.' },
  { icon: '🤝', cls: 'bg-lagoon', t: 'Collaborative Community', d: 'Work with a supportive, multicultural team that values respect, teamwork, and shared success.' },
  { icon: '🚀', cls: 'bg-[linear-gradient(135deg,#5b6cff,#7c87ff)]', t: 'Empowerment & Ownership', d: 'We give our team the freedom to make decisions, take responsibility, and grow into leadership roles.' },
  { icon: '📈', cls: 'bg-sunset', t: 'Continuous Learning', d: 'From training workshops to industry exposure, every employee has the opportunity to enhance their skills and advance in their career.' },
]

const perks = [
  'Competitive salaries and commission structures',
  'Career advancement paths',
  'Monthly rewards & recognition',
  'Travel discounts and exclusive employee offers',
  'Engagement activities & team-building events',
  'Flexible work environment (for selected roles)',
  'Exposure to the UAE tourism and global travel market',
  '2.5% cashback on every booking you make with us',
]

const departments = [
  { icon: '🎧', cls: 'bg-brand', t: 'Reservations & Customer Experience', d: 'Manage bookings, assist guests, and ensure seamless customer journeys.' },
  { icon: '🗺️', cls: 'bg-lagoon', t: 'Tour Operations & Coordination', d: 'Plan, organize, and monitor tours, activities, and excursions across the UAE.' },
  { icon: '📣', cls: 'bg-[linear-gradient(135deg,#5b6cff,#7c87ff)]', t: 'Marketing & Digital Growth', d: 'Be the creative force behind our brand, campaigns, and online presence.' },
  { icon: '💼', cls: 'bg-sunset', t: 'Sales & Business Development', d: 'Build partnerships, grow markets, and represent the company in B2B and B2C spaces.' },
  { icon: '📸', cls: 'bg-[linear-gradient(135deg,#f0568c,#ff7aa8)]', t: 'Social Media & Content Creation', d: 'Showcase the beauty of the UAE and our products through engaging photos, videos, and storytelling.' },
  { icon: '🚐', cls: 'bg-[linear-gradient(135deg,#17c08a,#0bb8a6)]', t: 'Drivers, Guides & Field Staff', d: 'Deliver on-ground experiences with professionalism and hospitality.' },
]

const steps = [
  { n: 1, t: 'Apply', d: 'Pick a role and send your CV with a short intro — by email or the form.' },
  { n: 2, t: 'We review', d: "Our team reviews your application and gets back to you if there's a fit." },
  { n: 3, t: "Let's talk", d: 'A friendly conversation to get to know you and the role in detail.' },
  { n: 4, t: 'Welcome aboard', d: 'Join the team and start building extraordinary journeys with us.' },
]

export default function CareersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobsLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="pointer-events-none absolute inset-0 opacity-90 [background:radial-gradient(38%_55%_at_8%_100%,rgba(23,192,138,.55),transparent_60%),radial-gradient(30%_45%_at_100%_0%,rgba(91,108,255,.5),transparent_60%)]" />
        <div className="container-xl relative z-10 py-24 md:py-28">
          <span className="pill glass text-white">✨ We&apos;re hiring — build the future of travel</span>
          <h1 className="font-display mt-6 max-w-[15ch] text-[clamp(2.6rem,7vw,4.6rem)] font-extrabold leading-[1.05]">
            Your career, in one place<span className="text-amber">.</span>
          </h1>
          <p className="mt-5 max-w-[680px] text-lg font-medium text-white/90">
            At The UAE Junction — the UAE&apos;s one-stop platform for tours, tickets and experiences —
            exceptional results come from exceptional people. Join a dynamic, collaborative team where
            you can truly make an impact. Where passion meets purpose.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a href="#openings" className="uj-btn uj-btn-line focus-ring">View open roles</a>
            <a href="#apply" className="uj-btn glass focus-ring text-white">Send your CV</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold text-white/95">
            <span>🌍 Remote-first roles</span>
            <span>🎟️ UAE tourism &amp; global travel</span>
            <span>💸 2.5% cashback employee perk</span>
          </div>
        </div>
        <svg className="block h-[70px] w-full" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,46 C320,8 1120,82 1440,34 L1440,70 L0,70 Z" fill="#ffffff" />
        </svg>
      </section>

      {/* Culture */}
      <section className="py-20">
        <div className="container-xl">
          <Head eyebrow="Our Work Culture" title="Where talent thrives 🌟"
            sub="We believe in creating an environment where talent thrives and passion fuels success. Every team member helps shape our services and elevate the travel experience." />
          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((p) => (
              <article key={p.t} className="uj-card p-8">
                <div className={`mb-4 grid h-14 w-14 place-items-center rounded-card text-2xl text-white ${p.cls}`}>{p.icon}</div>
                <h3 className="font-display mb-2 text-xl font-extrabold text-ink">{p.t}</h3>
                <p className="text-[#5a6b7b]">{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-[#f4f7fb] py-20">
        <div className="container-xl">
          <Head eyebrow="Life at The UAE Junction" title="A workplace that inspires excellence 🏖️"
            sub="A professional yet friendly environment designed to foster productivity, creativity, and personal growth. Whether you're in customer service, tour operations, or management, you'll create meaningful experiences every day." />
          <ul className="grid list-none gap-4 md:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-card border border-[#e8edf2] bg-white px-5 py-[18px] font-semibold shadow-card">
                <span aria-hidden className="bg-brand grid h-[26px] w-[26px] flex-none place-items-center rounded-lg text-sm text-white">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20">
        <div className="container-xl">
          <Head eyebrow="Departments" title="Departments you can grow in 🧭" sub="We offer opportunities across multiple divisions." />
          <div className="grid gap-6 md:grid-cols-3">
            {departments.map((d) => (
              <article key={d.t} className="uj-card p-8">
                <div className={`mb-4 grid h-14 w-14 place-items-center rounded-card text-2xl text-white ${d.cls}`}>{d.icon}</div>
                <h3 className="font-display mb-2 text-xl font-extrabold text-ink">{d.t}</h3>
                <p className="text-[#5a6b7b]">{d.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section id="openings" className="scroll-mt-24 bg-[#f4f7fb] py-20">
        <div className="container-xl">
          <Head eyebrow="Current Openings" title="Find your role 🔥" sub="All roles are Remote · Full-time. Tap a role to read the full description." />
          <div className="mx-auto grid max-w-[880px] gap-4">
            {roles.map((r) => (
              <details key={r.title} className="group uj-card overflow-hidden">
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 p-7 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="font-display block text-xl font-extrabold text-ink">{r.title}</span>
                    <span className="pill pill-cash mt-2">Remote · Full-time</span>
                  </span>
                  <span aria-hidden className="grid h-9 w-9 flex-none place-items-center rounded-full border-[1.5px] border-[#e8edf2] text-primary transition group-open:rotate-180 group-open:border-transparent group-open:bg-brand group-open:text-white">▾</span>
                </summary>
                <div className="px-7 pb-8 text-[#33455c]">
                  <p><strong className="text-ink">Job Summary:</strong> {r.summary}</p>
                  <h4 className="mb-2 mt-5 text-sm font-extrabold uppercase tracking-wide text-ink">Key Responsibilities</h4>
                  <ol className="list-decimal pl-5">{r.responsibilities.map((x, i) => <li key={i} className="my-1.5">{x}</li>)}</ol>
                  <h4 className="mb-2 mt-5 text-sm font-extrabold uppercase tracking-wide text-ink">Qualifications &amp; Experience</h4>
                  <ol className="list-decimal pl-5">{r.qualifications.map((x, i) => <li key={i} className="my-1.5">{x}</li>)}</ol>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section className="py-20">
        <div className="container-xl">
          <Head eyebrow="How to Apply" title="Simple and straightforward 🎯" sub="We've made applying easy — here's what to expect." />
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="uj-card p-7">
                <div className="bg-brand mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-full font-extrabold text-white">{s.n}</div>
                <h3 className="font-display mb-1.5 text-lg font-extrabold text-ink">{s.t}</h3>
                <p className="text-sm text-[#5a6b7b]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CareersInteractive />
    </>
  )
}

function Head({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mx-auto mb-12 max-w-[720px] text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="font-display mt-3 text-[clamp(1.9rem,4.2vw,2.8rem)] font-extrabold text-ink">{title}</h2>
      <p className="mt-4 text-lg text-[#5a6b7b]">{sub}</p>
    </div>
  )
}
