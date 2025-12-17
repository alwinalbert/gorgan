import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsWebcamActive(true);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      alert('Could not access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsWebcamActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {isWebcamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <Camera className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-500 text-sm">Camera feed inactive</p>
          </div>
        )}

        {/* Scanning overlay effect */}
        {isWebcamActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-4 border-red-500/30"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
          </div>
        )}

        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-red-500"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-red-500"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-red-500"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-red-500"></div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {!isWebcamActive ? (
          <button
            onClick={startWebcam}
            className="flex-1 min-w-30 bg-red-600 hover:bg-red-700 text-white font-bold py-2 md:py-3 px-3 md:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs md:text-base"
          >
            <Camera className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">START CAMERA</span>
            <span className="sm:hidden">START</span>
          </button>
        ) : (
          <>
            <button
              onClick={captureImage}
              className="flex-1 min-w-25 bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 px-3 md:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs md:text-base"
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">CAPTURE & ANALYZE</span>
              <span className="md:hidden">CAPTURE</span>
            </button>
            <button
              onClick={stopWebcam}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 md:py-3 px-3 md:px-6 rounded-lg transition-colors text-xs md:text-base"
            >
              STOP
            </button>
          </>
        )}

        {/* Upload Image Option */}
        <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-3 md:px-6 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-xs md:text-base">
          <Upload className="w-4 h-4 md:w-5 md:h-5" />
          <span>UPLOAD</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
