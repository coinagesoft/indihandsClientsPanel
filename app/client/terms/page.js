"use client";
import React from 'react'
import useAuthGuard from '../hooks/useAuthGuard';

const page = () => {
     useAuthGuard();
  return (
    <div className='text-center mt-t pt-5 pageTitle'>Terms and conditions</div>
  )
}

export default page