import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobApplicationsView } from './components/JobApplicationsView';
import { ThemeProvider } from './contexts/ThemeContext';
import './components/JobApplications.css';

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
        <div className="App">
          <JobApplicationsView />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
