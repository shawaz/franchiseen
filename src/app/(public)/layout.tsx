import React from 'react'

function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-900">
      {children}
    </div>
  )
}

export default PublicLayout;
