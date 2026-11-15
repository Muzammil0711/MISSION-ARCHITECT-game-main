import * as React from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/ui/components/Button'
import { Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { FileText, Star, Download, Link, Rocket } from 'lucide-react'
import { jsPDF } from 'jspdf'

const BADGES: Array<{ id: string; name: string; description: string; condition: (s: any) => boolean }> = [
  { id: 'lean', name: 'Lean Machine', description: 'All resources within margin (no warnings).', condition: (s) => s.rules?.violations.filter((v:any)=>v.severity==='warning').length === 0 },
  { id: 'datahoarder', name: 'Data Hoarder', description: 'Generated far more data than you could downlink.', condition: (s) => s.rules?.resources.data.status === 'exceeded' },
  { id: 'safemode', name: 'Safe Mode Survivor', description: 'Mission survived safe-mode events.', condition: (s) => s.simResult?.summary.safeModeDays > 0 },
  { id: 'liftoff', name: 'Liftoff', description: 'Successfully launched a mission.', condition: (s) => s.rules?.canLaunch === true },
  { id: 'nasa', name: 'NASA Analogue', description: 'Completed a scenario resembling a real NASA mission.', condition: (s) => !!s.design?.scenarioId && s.design.scenarioId !== 'sandbox' },
]

export function ReportPage() {
  const { score, design, rules, simResult, setPhase, generateReport } = useGameStore()

  React.useEffect(() => {
    if (!score && simResult) {
      generateReport()
    }
  }, [score, simResult, generateReport])

  if (!score || !simResult) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center animate-in fade-in zoom-in duration-400">
        <Card className="p-10">
          <FileText size={48} className="mx-auto mb-4 text-nasa-blue" />
          <h3 className="text-xl font-bold text-white mb-2">Generate Report</h3>
          <p className="text-space-400 mb-6">Run the operations simulation first to generate your post-mission report.</p>
          <Button variant="outline" onClick={() => setPhase('operations')}>Run Simulation</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <FileText size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 8 — Post-Mission Report</h2>
      </div>

      {/* Score card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-space-400 uppercase tracking-wider">Mission Score</div>
              <div className="text-5xl font-black text-white">{score.total} / 1000</div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${score.total >= 700 ? 'text-emerald-400' : score.total >= 500 ? 'text-amber-400' : 'text-red-400'}`}>
                {score.total >= 700 ? 'MISSION SUCCESS' : score.total >= 500 ? 'PARTIAL SUCCESS' : 'MISSION FAILED'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {([['Success', score.success], ['Science', score.science], ['Efficiency', score.efficiency], ['Risk', score.risk], ['Coord.', score.collab]] as const).map(([label, v]) => (
              <div key={label} className="p-3 rounded-xl border border-space-600 bg-space-900/50">
                <div className="text-[10px] text-space-500 uppercase">{label} <span className="text-[10px] font-normal">(w)</span></div>
                <div className="text-2xl font-mono font-bold text-white">{Math.round(v)}</div>
              </div>
            ))}
          </div>
          <ul className="text-xs text-space-400 space-y-1">
            {score.details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
        <div className="flex gap-3 flex-wrap">
          {BADGES.map((b) => {
            const earned = b.condition({ rules, simResult, design, score })
            return (
              <div key={b.id} className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                earned ? 'border-emerald-500 bg-emerald-900/30' : 'border-space-700/40 bg-space-900/50 text-space-500'
              }`}>
                <Star size={18} className={earned ? 'text-amber-500 animate-pulse' : 'text-space-600'} />
                <div>
                  <div className={`text-sm font-bold ${earned ? 'text-white' : 'text-space-400'}`}>{b.name}</div>
                  <div className="text-[11px] text-space-500">{b.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Top reasons + improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Why it {score.total >= 500 ? 'succeeded' : 'failed'}</CardTitle></CardHeader>
          <div className="space-y-3">
            {score.details.slice(0, 3).map((d, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[10px] bg-space-700 text-space-400 px-2 py-0.5 rounded">#{i + 1}</span>
                <span className="text-sm text-space-300">{d}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Suggested Improvements</CardTitle></CardHeader>
          <ul className="text-sm text-space-300 space-y-2 list-disc pl-5">
            <li>Add solar array area to close the power margin.</li>
            <li>Upgrade to X-band antenna to reduce data backlog.</li>
            <li>Choose Advanced (radiation-hardened) subsystems for longer life.</li>
          </ul>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" onClick={exportPDF} className="flex-1 sm:w-auto">
          <Download size={20} className="mr-2" /> Download PDF Report
        </Button>
        <Button variant="outline" size="lg" onClick={copyLink} className="flex-1 sm:w-auto">
          <Link size={20} className="mr-2" /> Share Mission Link
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setPhase('operations')}>
          <Rocket size={20} className="mr-2" /> Try Again with Changes
        </Button>
      </div>

      <div className="mt-8 p-4 rounded-xl border border-space-600 bg-space-800/30 text-xs text-space-500">
        <div className="font-bold text-white mb-2">Compare with another team</div>
        <p>Paste another team's mission URL to compare designs side by side (feature enabled via shareable links).</p>
      </div>

      {/* NASA resources */}
      <Card className="mt-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Data & Sources</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setPhase('datasources')}>Open sources page</Button>
        </CardHeader>
        <div className="text-xs text-space-400 space-y-1 mt-3">
          <div>Real missions referenced: Landsat, JWST/Hubble/Chandra, LRO, MRO.</div>
          <div>Frameworks: JPL CML, MDL; tools: GMAT, Mission Viz; guides: CubeSat 101.</div>
          <div className="mt-2 flex gap-3">
            <a href="https://www.nasa.gov/" target="_blank" rel="noopener" className="text-nasa-blue hover:underline">NASA.gov</a>
            <a href="https://www.jpl.nasa.gov/" target="_blank" rel="noopener" className="text-nasa-blue hover:underline">JPL</a>
            <a href="https://www.nasa.gov/mission_pages/smallspacecraft/cubesat-101.html" target="_blank" rel="noopener" className="text-nasa-blue hover:underline">CubeSat 101</a>
          </div>
        </div>
      </Card>
    </div>
  )

  function exportPDF() {
    if (!score || !simResult) return
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('MISSION ARCHITECT — Post-Mission Report', 20, 20)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Score: ${score.total} / 1000`, 20, 35)
    doc.text(`Scenario: ${design.scenarioId}`, 20, 45)
    doc.text(`Objective: ${design.objectiveId || '—'}`, 20, 55)
    doc.text(`Orbit: ${design.orbitId || '—'}  |  Launcher: ${design.launchVehicleId || '—'}`, 20, 65)
    doc.text(`Science: ${simResult.summary.finalScience.toFixed(0)}  |  Downlinked: ${simResult.summary.totalDownlinkedGB.toFixed(1)} GB`, 20, 75)
    doc.text('Details:', 20, 88)
    score.details.forEach((d: string, i: number) => doc.text(`• ${d}`, 24, 98 + i * 8))
    doc.save(`mission-architect-report-${design.scenarioId}.pdf`)
  }

  function copyLink() {
    const url = new URL(window.location.href)
    url.searchParams.set('mission', btoa(JSON.stringify(design)))
    navigator.clipboard.writeText(url.toString()).then(() => {
      // could add toast
    })
  }
}

export default ReportPage;
