'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getStudentById } from '@/lib/actions/student.actions';
import { getQrCode, generateQRCode } from '@/lib/actions/qrCode.actions';

const StudentCard = ({ params }: { params: Promise<CardParamProps['params']> }) => {
  const { studentId } = React.use(params);

  const [isLoading, setIsLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [qrImg, setQrImg] = useState('');

  useEffect(() => {
    if (!studentId) {
      setErrorMessage("No student ID provided.");
      return;
    }

    const getStudent = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const studentIdNumber = parseInt(studentId, 10);

        if (isNaN(studentIdNumber)) {
          throw new Error("Please enter a valid student ID number");
        }

        const result = await getStudentById(studentId);

        if (result) {
          setStudent(result);
          setSuccessMessage("Student found!");

          const createdQrCode = await generateQRCode(studentId);
          if (createdQrCode) {
            console.log("QR Code generated successfully:", createdQrCode);

            const qrCodeData = await getQrCode(studentId);
            if (qrCodeData) {
              const qrDataUrl = await QRCode.toDataURL(qrCodeData);
              setQrImg(qrDataUrl);
            } else {
              console.warn("QR code data not found after generation");
            }
          } else {
            console.warn("Failed to generate QR code");
          }
        } else {
          throw new Error("Student not found");
        }
      } catch (error: unknown) {
        console.error("Error fetching student:", error);
        setErrorMessage((error as Error).message || "An error occurred while fetching the student.");
      } finally {
        setIsLoading(false);
      }
    };

    getStudent();
  }, [studentId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (errorMessage) {
    return <div className="text-red-500">{errorMessage}</div>;
  }

  if (!student) {
    return <div>No student data available.</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
        <p className="text-gray-600">ID: {student.id}</p>
        {student.email && <p className="text-gray-600">Email: {student.email}</p>}
        
        {qrImg && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">QR Code:</h3>
            <Image 
              src={qrImg} 
              alt="Student QR Code" 
              width={200} 
              height={200}
              className="border"
            />
          </div>
        )}
        
        {successMessage && (
          <div className="text-green-500 text-sm">{successMessage}</div>
        )}
      </div>

      <div className="w-full flex items-center justify-center mt-6">
        <Link href="/" className="text-sm text-[#4a5568] font-semibold hover:underline">
          Back
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;