
import AdminHeader from '@/components/admin/AdminHeader';
import React from 'react'

function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <div className="max-w-7xl min-h-[calc(100vh-320px)] mx-auto md:px-6 lg:px-8 pt-[80px] pb-20 md:pb-0">
        {children}
      </div>
    </>
  )
}

export default AdminLayout;