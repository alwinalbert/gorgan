import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Activity } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [motionLevel, setMotionLevel] = useState(0);
  const detectionEnabled = true;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const motionTimeoutRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const sensitivity = 30; // Motion detection sensitivity (0-100)

  // Auto-start webcam on mount
  useEffect(() => {
    const initWebcam = async () => {
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
      }
    };

    initWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Motion detection function
  const detectMotion = useCallback(() => {
    if (!videoRef.current || !detectionEnabled || !isWebcamActive) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(detectMotion);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth / 4; // Reduce size for performance
    canvas.height = video.videoHeight / 4;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (previousFrameRef.current) {
      let motionPixels = 0;
      const threshold = sensitivity * 2.55; // Convert 0-100 to 0-255

      // Compare with previous frame
      for (let i = 0; i < currentFrame.data.length; i += 4) {
        const diff = Math.abs(currentFrame.data[i] - previousFrameRef.current.data[i]) +
                     Math.abs(currentFrame.data[i + 1] - previousFrameRef.current.data[i + 1]) +
                     Math.abs(currentFrame.data[i + 2] - previousFrameRef.current.data[i + 2]);

        if (diff > threshold) {
          motionPixels++;
        }
      }

      const totalPixels = canvas.width * canvas.height;
      const motionPercentage = (motionPixels / totalPixels) * 100;

      setMotionLevel(Math.round(motionPercentage * 10) / 10);

      // Trigger motion detection and keep it visible for 1 second
      if (motionPercentage > 1.5) {
        setMotionDetected(true);

        // Clear any existing timeout
        if (motionTimeoutRef.current) {
          clearTimeout(motionTimeoutRef.current);
        }

        // Set timeout to turn off motion detection after 1 second
        motionTimeoutRef.current = window.setTimeout(() => {
          setMotionDetected(false);
        }, 1000);
      }
    }

    previousFrameRef.current = currentFrame;
    animationFrameRef.current = requestAnimationFrame(detectMotion);
  }, [detectionEnabled, isWebcamActive, sensitivity]);

  // Start motion detection when webcam activates
  useEffect(() => {
    if (isWebcamActive && detectionEnabled) {
      detectMotion();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isWebcamActive, detectionEnabled, detectMotion]);

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
            <p className="text-gray-500 text-sm">Initializing camera...</p>
          </div>
        )}

        {/* Motion detection overlay */}
        {isWebcamActive && motionDetected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-4 border-yellow-500/50 animate-pulse"></div>
            <div className="absolute top-4 left-4 bg-yellow-500/90 text-black px-3 py-1 rounded-md font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              MOTION DETECTED
            </div>
          </div>
        )}

        {/* Scanning overlay effect */}
        {isWebcamActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute inset-0 border-4 ${motionDetected ? 'border-yellow-500/30' : 'border-red-500/30'}`}></div>
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${motionDetected ? 'via-yellow-500' : 'via-red-500'} to-transparent animate-scan`}></div>
          </div>
        )}

        {/* Motion level indicator */}
        {isWebcamActive && detectionEnabled && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-md">
            <div className="flex items-center gap-2 text-xs">
              <Activity className={`w-4 h-4 ${motionDetected ? 'text-yellow-500' : 'text-gray-500'}`} />
              <span className="text-white font-mono">{motionLevel.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Corner brackets */}
        <div className={`absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 ${motionDetected ? 'border-yellow-500' : 'border-red-500'}`}></div>
        <div className={`absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 ${motionDetected ? 'border-yellow-500' : 'border-red-500'}`}></div>
        <div className={`absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 ${motionDetected ? 'border-yellow-500' : 'border-red-500'}`}></div>
        <div className={`absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 ${motionDetected ? 'border-yellow-500' : 'border-red-500'}`}></div>
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
