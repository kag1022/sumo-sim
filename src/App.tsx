import { BanzukeTable } from './components/BanzukeTable';
import { ControlPanel } from './components/ControlPanel';
import { DailyMatches } from './components/DailyMatches';
import { useSumoStore } from './store/useSumoStore';
import { useEffect } from 'react';

function App() {
  const init = useSumoStore(state => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto relative pb-32">
      <header className="mb-8 text-center border-b-4 border-sumo-black pb-4">
        <h1 className="text-4xl font-black mb-2 tracking-widest font-sumo">大相撲 令和番付</h1>
        <p className="text-sm opacity-70 tracking-widest">SUMO SIMULATION 2025</p>
      </header>
      
      <main>
        <BanzukeTable />
      </main>

      <ControlPanel />
      <DailyMatches />
    </div>
  )
}

export default App

