import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PublicHolidays from 
'./components/components/PublicHolidays'

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <PublicHolidays />
    </QueryClientProvider>
  );
}

export default App;