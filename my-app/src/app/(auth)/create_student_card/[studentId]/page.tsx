'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getStudentById } from '@/lib/actions/student.actions';
import { generateQRCode } from '@/lib/actions/qrCode.actions';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LuDownload, LuRotateCcw } from "react-icons/lu";
import Loader from "@/components/main/Loader";

const StudentCard = ({ params }: { params: Promise<CardParamProps['params']> }) => {
  const { studentId } = React.use(params);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [qrImg, setQrImg] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

        if (studentId) {
          const createdQrCode = await generateQRCode(studentId);
          if (createdQrCode) {
            console.log("QR Code generated successfully:", createdQrCode);

            const result = await getStudentById(studentId);

            if (result) {
              console.log("Student data fetched successfully:", result);
              setStudent(result);
              setSuccessMessage("Student found!");
              setQrImg(result.qrCode.url);
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

  const FrontCard = ({ className = "" }: { className?: string }) => (
    <Card className={`!w-80 !h-52 ${className}`}>
      <CardContent className="!p-0 !h-full !bg-gradient-to-br !from-blue-600 !to-blue-800 !text-white !relative !overflow-hidden">
        <div className="!p-4 !flex !gap-4">
          <div className="!flex-shrink-0">
            <Image
              src={student.picture}
              alt={student?.name || "Student"}
              width={80}
              height={96}
              className="!w-20 !h-24 !object-cover !rounded !border-2 !border-white/30"
            />
          </div>
          <div className="!flex-1 !space-y-1">
            <h3 className="!font-bold !text-lg !leading-tight">{student?.name}</h3>
            <p className="!text-sm !opacity-90">{student?.email}</p>
            <div className="!space-y-1">
              <Badge variant="secondary" className="!text-xs !bg-white/20 !text-white !border-white/30">
                {student?.class.description}
              </Badge>
              <p className="!text-xs !opacity-80">ID: {student?.id}</p>
              <p className="!text-xs !opacity-80">
                {student?.class?.name} • Valid until {student?.qrCode?.validUntil}
              </p>
            </div>
          </div>
        </div>
        <div className="!absolute !top-0 !right-0 !w-20 !h-20 !bg-white/5 !rounded-full !-translate-y-10 !translate-x-10" />
        <div className="!absolute !bottom-0 !left-0 !w-16 !h-16 !bg-white/5 !rounded-full !translate-y-8 !-translate-x-8" />
      </CardContent>
    </Card>
  );

  const BackCard = ({ className = "" }: { className?: string }) => (
    <Card className={`!w-80 !h-52 ${className}`}>
      <CardContent className="!p-0 !h-full !bg-gradient-to-br !from-gray-700 !to-gray-900 !text-white !relative !overflow-hidden">
        <div className="!py-6 !px-4 !flex !flex-row !items-center !justify-between !h-full">
          <div className="!w-32 !h-32 !bg-white !rounded-lg !flex !items-center !justify-center">
            {qrImg ? (
              <Image
                src={qrImg}
                alt="QR Code"
                width={120}
                height={120}
                className="!w-28 !h-28"
              />
            ) : (
              <div className="!w-20 !h-20 !bg-black !relative">
                <div className="!absolute !inset-1 !bg-white" />
                <div className="!absolute !inset-2 !bg-black !grid !grid-cols-6 !gap-px">
                  {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className={`${Math.random() > 0.5 ? "!bg-white" : "!bg-black"}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="!text-center !space-y-2 !flex-1 !px-4">
            <p className="!text-xs !opacity-60">This card remains property of the University</p>
            <p className="!text-xs !opacity-80">Authorized Personnel Only</p>
            <div className="!mt-4 !space-y-1">
              <p className="!text-xs !opacity-60">For assistance contact:</p>
              <p className="!text-xs !opacity-80">Student Services</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleDownload = async () => {
    if (!student || !frontCardRef.current || !backCardRef.current) return;

    setIsDownloading(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvasOptions = {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 320,
        height: 208,
        windowWidth: 320,
        windowHeight: 208
      };

      const frontCanvas = await html2canvas(frontCardRef.current, canvasOptions);

      await new Promise(resolve => setTimeout(resolve, 100));

      const backCanvas = await html2canvas(backCardRef.current, canvasOptions);

      const combinedCanvas = document.createElement('canvas');
      const ctx = combinedCanvas.getContext('2d');
      
      if (ctx) {
        const spacing = 60;
        const padding = 40;

        combinedCanvas.width = frontCanvas.width + backCanvas.width + spacing + (padding * 2);
        combinedCanvas.height = Math.max(frontCanvas.height, backCanvas.height) + (padding * 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

        ctx.drawImage(frontCanvas, padding, padding);

        ctx.drawImage(backCanvas, frontCanvas.width + spacing + padding, padding);

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        const labelY = combinedCanvas.height - 15;
        
        ctx.fillText('FRONT', padding + (frontCanvas.width / 2), labelY);
        ctx.fillText('BACK', frontCanvas.width + spacing + padding + (backCanvas.width / 2), labelY);
      }

      combinedCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${student.name.replace(/\s+/g, '_')}_Student_ID_Card.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error downloading card:', error);
      alert('Failed to download card. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!student || !frontCardRef.current || !backCardRef.current) return;

    setIsDownloading(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas-pro')).default;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const canvasOptions = {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      };

      const frontCanvas = await html2canvas(frontCardRef.current, canvasOptions);
      await new Promise(resolve => setTimeout(resolve, 100));
      const backCanvas = await html2canvas(backCardRef.current, canvasOptions);

      const cardWidth = 85;
      const cardHeight = 55;
      const spacing = 10;
      const startX = 10;
      const startY = 30;

      const frontImgData = frontCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(frontImgData, 'PNG', startX, startY, cardWidth, cardHeight);

      const backImgData = backCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(backImgData, 'PNG', startX + cardWidth + spacing, startY, cardWidth, cardHeight);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FRONT', startX + (cardWidth / 2), startY + cardHeight + 10, { align: 'center' });
      pdf.text('BACK', startX + cardWidth + spacing + (cardWidth / 2), startY + cardHeight + 10, { align: 'center' });

      pdf.setFontSize(16);
      pdf.text('Student ID Card', 148, 20, { align: 'center' });

      pdf.save(`${student.name.replace(/\s+/g, '_')}_Student_ID_Card.pdf`);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !w-[48vw] !h-[95vh]">
        <Loader size="3em" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="!flex !items-center !justify-center !h-screen">
        <div className="!text-red-500 !text-lg">{errorMessage}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="!flex !items-center !justify-center !w-[48vw] !h-[95vh]">
        <div className="!text-lg">No student data available.</div>
      </div>
    );
  }

  return (
    <div className="!flex !flex-col !items-center !justify-center !w-[48vw] !h-[95vh] !py-8">
      <div className="!bg-white/10 !p-3 !text-center !border-b !border-white/20 !mb-8">
        <h2 className="!font-bold !text-lg">University</h2>
        <p className="!text-xs !opacity-90">Student Identification Card</p>
      </div>

      <div className="!relative !mb-8">
        <div
          className={`!relative !w-80 !h-52 !transition-transform !duration-700 !transform-style-preserve-3d ${
            isFlipped ? "!rotate-y-180" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className={`!absolute !inset-0 !w-full !h-full !backface-hidden ${isFlipped ? "!rotate-y-180" : ""}`}>
            <FrontCard />
          </div>
          <div className={`!absolute !inset-0 !w-full !h-full !backface-hidden !rotate-y-180 ${!isFlipped ? "!rotate-y-180" : ""}`}>
            <BackCard />
          </div>
        </div>
      </div>

      <div className="!fixed !-top-[1000px] !-left-[1000px] !opacity-0 !pointer-events-none">
        <div ref={frontCardRef}>
          <FrontCard />
        </div>
        <div ref={backCardRef} className="!mt-4">
          <BackCard />
        </div>
      </div>

      <div className="!flex !gap-4 !mb-6">
        <Button 
          variant="outline" 
          onClick={() => setIsFlipped(!isFlipped)} 
          className="!flex !items-center !gap-2"
          disabled={isDownloading}
        >
          <LuRotateCcw className="!w-4 !h-4" />
          Flip Card
        </Button>
        <Button 
          onClick={handleDownload} 
          className="!flex !items-center !gap-2 !bg-blue-600 !hover:bg-blue-700"
          disabled={isDownloading}
        >
          <LuDownload className="!w-4 !h-4" />
          {isDownloading ? 'Downloading...' : 'Download PNG'}
        </Button>
        <Button 
          onClick={handleDownloadPDF} 
          className="!flex !items-center !gap-2 !bg-green-600 !hover:bg-green-700"
          disabled={isDownloading}
        >
          <LuDownload className="!w-4 !h-4" />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
      </div>

      <div className="!text-center !text-sm !text-gray-600 !max-w-md !mb-8">
        <p>
          This digital student ID card contains all necessary information for campus access and identification. Click
          "Flip Card" to view the QR code on the back for digital verification.
        </p>
      </div>

      <div className="!text-center">
        <p className="!text-lg">
          Return 
          <Link href="/" className="!text-blue-600 !font-semibold !ml-1 !hover:underline">
            Back
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentCard;
