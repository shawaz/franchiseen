"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import BrandDashboard from '@/components/app/franchiser/BrandDashboard';

export default function BrandAccount() {
  const params = useParams();
  const brandSlug = params.brandSlug as string;

  return (
    <BrandDashboard brandSlug={brandSlug} />
  );
}