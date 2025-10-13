import Footer from '@/components/app/Footer';
import FooterMobile from '@/components/app/FooterMobile';
import Header from '@/components/app/Header';
import React from 'react'

function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* <NetworkBanner /> */}

      <div className="max-w-7xl min-h-[calc(100vh-320px)] mx-auto md:px-6 lg:px-8 pt-[40px] md:pt-[40px] pb-20 md:pb-0">
        {children}
      </div>
      <FooterMobile />
      <Footer />
    </>
  )
}

export default PlatformLayout;