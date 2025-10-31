'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VideoDisplay() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsVideoOn(true);
        }
      } else {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
          setIsVideoOn(false);
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };
  
  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };
  
  return (
    <Card className="overflow-hidden w-full relative">
      <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p>Setting up your interview...</p>
          </div>
        ) : isVideoOn ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted={!isAudioOn} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <CameraOff className="h-12 w-12 mb-2" />
            <p>Camera is off</p>
            <Button onClick={toggleVideo} size="sm">Turn on camera</Button>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button 
          size="icon" 
          variant="secondary" 
          className={cn(
            "rounded-full bg-background/80 backdrop-blur-sm",
            !isVideoOn && "bg-destructive text-destructive-foreground hover:bg-destructive/80"
          )}
          onClick={toggleVideo}
        >
          {isVideoOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </Button>
        
        <Button 
          size="icon" 
          variant="secondary" 
          className={cn(
            "rounded-full bg-background/80 backdrop-blur-sm",
            !isAudioOn && "bg-destructive text-destructive-foreground hover:bg-destructive/80"
          )}
          onClick={toggleAudio}
        >
          {isAudioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
}