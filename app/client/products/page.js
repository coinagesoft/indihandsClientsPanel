"use client";

import { Suspense } from "react";
import ProductListingClient from "./ProductListingClient";

export default function ProductListingPage() {
  return (
    <Suspense fallback={<div className="text-center mt-5">Loading products...</div>}>
      <ProductListingClient />
    </Suspense>
  );
}
