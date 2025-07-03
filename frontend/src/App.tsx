import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobApplicationsView } from './components/JobApplicationsView';
import { ThemeProvider } from './contexts/ThemeContext';
import './components/JobApplications.css';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <JobApplicationsView />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
