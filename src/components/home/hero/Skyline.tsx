// Original stylised Dubai skyline — WHITE LINE ART ONLY (stroke, no fill).
// Pure SVG, scales to any width (preserveAspectRatio slice), zero JS / zero
// network — feather-light and crisp on every device.
export function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      fill="none"
      stroke="#ffffff"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <g strokeWidth="1.6" opacity="0.55">
        {/* ground line */}
        <line x1="0" y1="292" x2="1440" y2="292" />

        {/* far-left low blocks */}
        <path d="M20 292V236h44v56M30 250h24M30 266h24M30 280h24" />
        <path d="M78 292V214h34v78M86 230h18M86 250h18M86 270h18" />

        {/* twin towers */}
        <path d="M150 292V150h30v142M152 170h26M152 196h26M152 222h26M152 248h26" />
        <path d="M188 292V120h30v172M190 142h26M190 170h26M190 198h26M190 226h26M190 254h26" />

        {/* dome / observatory */}
        <path d="M250 292v-44a26 26 0 0 1 52 0v44" />
        <line x1="276" y1="200" x2="276" y2="184" />

        {/* Burj-style supertall tower (tapered, stepped, spire) */}
        <path d="M360 292 365 96 375 96 380 292" />
        <path d="M364 200 376 200M362 150 378 150M366 250 374 250" />
        <line x1="370" y1="96" x2="370" y2="40" />

        {/* twisted tower (parallelogram stack) */}
        <path d="M430 292V150l34-10v152M432 176l34-10M432 206l34-10M432 236l34-10" />

        {/* sail-shaped tower */}
        <path d="M520 292V150c0-46 34-72 70-84v226" />
        <path d="M536 200c14-30 36-44 54-52M540 240c12-26 32-40 50-48" />

        {/* mid cluster */}
        <path d="M640 292V178h40v114M646 198h28M646 222h28M646 248h28" />
        <path d="M690 292V206h28v86M694 224h20M694 250h20" />

        {/* tall slab with antenna */}
        <path d="M760 292V128h36v164M764 150h28M764 180h28M764 210h28M764 244h28" />
        <line x1="778" y1="128" x2="778" y2="86" />

        {/* picture-frame style structure */}
        <path d="M850 292V160h70v132M850 184h70" />
        <path d="M864 292V184M906 292V184" />

        {/* stepped pyramid tower */}
        <path d="M960 292l8-110h44l8 110M972 230h36M968 200h44" />

        {/* second supertall accent */}
        <path d="M1050 292 1055 116 1063 116 1068 292M1052 200 1066 200M1054 250 1064 250" />
        <line x1="1059" y1="116" x2="1059" y2="68" />

        {/* right cluster */}
        <path d="M1120 292V172h38v120M1126 192h26M1126 216h26M1126 244h26" />
        <path d="M1168 292V210h30v82M1172 228h22M1172 256h22" />
        <path d="M1210 292V150h34v142M1214 172h26M1214 200h26M1214 228h26M1214 256h26" />

        {/* far-right low blocks */}
        <path d="M1262 292V232h40v60M1270 248h24M1270 268h24" />
        <path d="M1316 292V206h36v86M1322 224h24M1322 250h24" />
        <path d="M1366 292V244h44v48M1374 260h28M1374 278h28" />
      </g>
    </svg>
  )
}
