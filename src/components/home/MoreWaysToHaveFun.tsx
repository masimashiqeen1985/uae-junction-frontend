const ITEMS=[
  {l:'Dhow Cruise Dinner',h:'/dhow-cruise',accent:'from-blue-600 to-secondary'},
  {l:'City Sightseeing',h:'/uae-city-tours',accent:'from-secondary to-teal-700'},
  {l:'Adventure Experiences',h:'/experiences',accent:'from-orange-500 to-primary'},
  {l:'Water Park Fun',h:'/water-parks',accent:'from-cyan-500 to-blue-600'},
  {l:'Desert Adventures',h:'/desert-safari',accent:'from-amber-600 to-orange-600'},
  {l:'Theme Park Thrills',h:'/theme-parks',accent:'from-fuchsia-600 to-primary'},
]
export function MoreWaysToHaveFun(){
  return(
    <section className="py-16 bg-white">
      <div className="container-xl">
        <h2 className="font-display font-bold text-3xl text-center text-secondary mb-12">More Ways To Have Fun</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ITEMS.map(i=>(
            <a key={i.l} href={i.h} className={`group relative h-44 sm:h-52 rounded-card overflow-hidden flex items-end p-5 text-white bg-gradient-to-br ${i.accent}`}>
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors"/>
              <span className="relative z-10 font-display font-semibold text-lg drop-shadow">{i.l}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
