import React from 'react'
import Footer from '@/components/app/Footer'
import Header from '@/components/app/Header';
import NetworkErrorBoundary from '@/components/app/NetworkErrorBoundary';

function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NetworkErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-stone-900 flex flex-col">
        <Header />
        <main className="flex-1 mt-16">
          {children}
        </main>
        <Footer />
      </div>
    </NetworkErrorBoundary>
  )
}

export default PublicLayout;
