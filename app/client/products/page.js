"use client";

import { Suspense } from "react";
import ProductListingClient from "./ProductListingClient";

export default function ProductListingPage() {
  return (
   
    <Suspense>
      <ProductListingClient />
    </Suspense>
    
  );
}
