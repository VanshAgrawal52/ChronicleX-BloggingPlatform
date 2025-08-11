import '../styles.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Toaster } from 'sonner';

const client = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <QueryClientProvider client={client}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster richColors position="top-right" duration={1500} closeButton theme="system" />
      </QueryClientProvider>
    </AuthProvider>
  );
}