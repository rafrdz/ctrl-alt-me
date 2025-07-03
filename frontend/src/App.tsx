import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobApplicationsView } from './components/JobApplicationsView';
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
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <JobApplicationsView />
      </div>
    </QueryClientProvider>
  );
}

export default App;
