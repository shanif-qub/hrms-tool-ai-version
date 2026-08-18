import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import AuthGateway from './components/AuthGateway';
import Continuum from './components/Continuum';
import { WorkspaceProvider } from './store';
import { ThemeProvider } from './theme';

export default function App() {
  const [authed, setAuthed] = useState(false);
  return (
    <ThemeProvider>
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          {!authed
            ? <AuthGateway key="auth" onLogin={() => setAuthed(true)} />
            : <WorkspaceProvider key="ws"><Continuum /></WorkspaceProvider>}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}
