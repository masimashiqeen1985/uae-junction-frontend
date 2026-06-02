export function Hero(){
  return(
    <section className="relative min-h-[78vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,165,0,0.25),transparent_45%)]"/>
      <div className="absolute inset-0 bg-black/40"/>
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto py-24">
        <span className="inline-block bg-primary/90 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">4% Cashback on Every Booking</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl mb-5 leading-tight">Your Journey Is Our Passion</h1>
        <p className="text-neutral-100 text-base sm:text-lg mb-9 max-w-2xl mx-auto leading-relaxed">Every journey holds a promise, every destination unfolds a story. Theme parks, desert safaris, dhow cruises, hotels and flights — booked your way, with rewards on every trip.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/theme-parks" className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-btn font-semibold transition-colors shadow-lg shadow-primary/30">Explore Packages</a>
          <a href="#quote" className="border-2 border-white text-white hover:bg-white hover:text-secondary-dark px-8 py-3.5 rounded-btn font-semibold transition-all">Get a Free Quote</a>
        </div>
      </div>
    </section>
  )
}
