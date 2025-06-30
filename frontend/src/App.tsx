import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobApplicationsList } from './components/JobApplicationsList';
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
        <JobApplicationsList />
      </div>
    </QueryClientProvider>
  );
}

export default App;
