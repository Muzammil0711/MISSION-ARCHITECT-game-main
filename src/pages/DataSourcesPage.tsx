import { Button, Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { useGameStore } from '@/store/gameStore'

export default function DataSourcesPage() {
  const { setPhase } = useGameStore()
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-space-700 flex items-center justify-center text-space-400">
          <span className="text-xs">📚</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Data & Sources</h1>
      </div>
      <p className="text-space-400">
        MISSION ARCHITECT teaches real mission design through simplified models. This page credits the NASA resources
        used and clearly states what is simplified versus real.
      </p>

      <Card>
        <CardHeader><CardTitle>NASA Resources Referenced</CardTitle></CardHeader>
        <div className="space-y-3 p-4">
          <div className="flex flex-col md:flex-row justify-between gap-3 p-3 rounded-lg border border-space-700 bg-space-900/40">
            <div>
              <div className="font-semibold text-white">Design and Develop Science Missions (NASA)</div>
              <div className="text-[11px] text-space-500">Mission lifecycle framework used for the 8 game phases.</div>
            </div>
            <a href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-nasa-blue-glow hover:underline text-[11px]">nasa.gov →</a>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-3 p-3 rounded-lg border border-space-700 bg-space-900/40">
            <div>
              <div className="font-semibold text-white">JPL Concept Maturity Level (CML)</div>
              <div className="text-[11px] text-space-500">CML 1→4 progress bar references JPL's CML framework.</div>
            </div>
            <a href="https://www.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-nasa-blue-glow hover:underline text-[11px]">jpl.nasa.gov →</a>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-3 p-3 rounded-lg border border-space-700 bg-space-900/40">
            <div>
              <div className="font-semibold text-white">Mission Design Lab (MDL)</div>
              <div className="text-[11px] text-space-500">Simplified MDL stages inform the game phases and trade studies.</div>
            </div>
            <a href="https://mdl.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-nasa-blue-glow hover:underline text-[11px]">mdl.jpl.nasa.gov →</a>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-3 p-3 rounded-lg border border-space-700 bg-space-900/40">
            <div>
              <div className="font-semibold text-white">GMAT (General Mission Analysis Tool)</div>
              <div className="text-[11px] text-space-500">Orbital-period formula inspiration (T = 2π√(a³/μ)).</div>
            </div>
            <a href="https://gmat.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-nasa-blue-glow hover:underline text-[11px]">gmat.gsfc.nasa.gov →</a>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-3 p-3 rounded-lg border border-space-700 bg-space-900/40">
            <div>
              <div className="font-semibold text-white">NASA Mission Viz</div>
              <div className="text-[11px] text-space-500">Inspiration for the 3D orbit/Earth scene.</div>
            </div>
            <a href="https://www.nasa.gov/mission-viz" target="_blank" rel="noopener noreferrer" className="text-nasa-blue-glow hover:underline text-[11px]">nasa.gov/mission-viz →</a>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-3 p-3 rounded-lg border border-space-700 bg-space-900/40">
            <div>
              <div className="font-semibold text-white">CubeSat 101</div>
              <div className="text-[11px] text-space-500">3U/6U/12U bus sizes and beginner mission concepts.</div>
            </div>
            <a href="https://www.nasa.gov/mission_pages/smallspacecraft/cubesat-101.html" target="_blank" rel="noopener noreferrer" className="text-nasa-blue-glow hover:underline text-[11px]">cubesat-101 →</a>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Real Missions Used as Analogues</CardTitle></CardHeader>
        <div className="p-4 space-y-3">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-space-700">
                <th className="pb-2 text-space-500 text-[10px] uppercase font-semibold">Scenario</th>
                <th className="pb-2 text-space-500 text-[10px] uppercase font-semibold">Real NASA Mission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              <tr>
                <td className="py-2 text-space-300">Earth Observation CubeSat</td>
                <td className="py-2 text-space-300">Landsat / VIIRS (Suomi NPP)</td>
              </tr>
              <tr>
                <td className="py-2 text-space-300">Space Telescope</td>
                <td className="py-2 text-space-300">Hubble / JWST / Chandra</td>
              </tr>
              <tr>
                <td className="py-2 text-space-300">Lunar Orbiter / Lander</td>
                <td className="py-2 text-space-300">LRO (Lunar Reconnaissance Orbiter)</td>
              </tr>
              <tr>
                <td className="py-2 text-space-300">Mars Orbiter</td>
                <td className="py-2 text-space-300">MRO (Mars Reconnaissance Orbiter)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Simplified vs Real</CardTitle></CardHeader>
        <div className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-space-700 bg-space-900/40">
              <div className="text-emerald-400 font-bold text-xs mb-1">Simplified (game)</div>
              <ul className="text-xs text-space-400 space-y-1 list-disc pl-4">
                <li>Single-body gravity; no n-body perturbations</li>
                <li>Instantaneous orbit changes (no transfer time)</li>
                <li>Link budget = inverse-square approximation</li>
                <li>Component reliability as constant probability</li>
                <li>Fictional-but-realistic launch vehicle classes</li>
                <li>Day-by-day simulation (not real-time)</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border border-space-700 bg-space-900/40">
              <div className="text-amber-400 font-bold text-xs mb-1">Real (reference)</div>
              <ul className="text-xs text-space-400 space-y-1 list-disc pl-4">
                <li>Kepler's third law: T = 2π√(a³/μ)</li>
                <li>Tsiolkovsky rocket equation for Δv</li>
                <li>Inverse-square link budget / data rate vs distance</li>
                <li>Eclipse fraction from orbital geometry</li>
                <li>NASA CML / MDL phase framework</li>
                <li>DSN ground-station concept</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Media Usage & Attribution</CardTitle></CardHeader>
        <div className="p-4 text-xs text-space-400 space-y-2">
          <div>All code is original, MIT-licensed or compatible open source.</div>
          <div>No NASA logos or insignia are used; the "MA" mark is an original game logo.</div>
          <div>Follows NASA Media Usage Guidelines (https://www.nasa.gov/multimedia/guidelines/index.html).</div>
          <div>Third-party libraries: React, Vite, TypeScript, Tailwind CSS, three.js, @react-three/fiber, recharts, zustand, lucide-react, jspdf, framer-motion, uuid — all MIT/Apache/BSD compatible.</div>
          <div>Asset placeholder: none (all UI is code-generated; no external images).</div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setPhase('concept')}>Back to game</Button>
      </div>
    </div>
  )
}
