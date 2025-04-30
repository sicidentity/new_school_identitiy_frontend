'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PasswordSetPage = () => {

  return (
    <div className="flex flex-col items-center justify-center w-full md:w-[48vw] h-[95vh]">
      <header className="flex flex-col items-center w-full md:w-[30vw] mb-6">
        <Image
          src="/images/verified.svg"
          alt="Logo"
          width={50}
          height={50}
          className="mb-4"
        />
        <h1 className="text-2xl text-black font-bold">All done!</h1>
        <p className="text-sm text-[#4a5568] mt-2 text-center">Your password has been reset.</p>
      </header>

      <div className="flex justify-center items-center w-[30vw]">
        <Link href="/login" className="mt-6 bg-[#258094] text-white font-bold py-2 px-4 rounded-md w-[20vw] cursor-pointer flex items-center justify-center">
          Continue to  Log in
        </Link>
      </div>
    </div>
  );
};

export default PasswordSetPage;