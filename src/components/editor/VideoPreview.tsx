import { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { TimelineClip } from '@/types/editor';

interface VideoPreviewProps {
  clips: TimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  duration: number;
}

export const VideoPreview = ({
  clips,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
  duration,
}: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentClip = clips.find(
    (clip) => clip.type === 'video' && currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration
  );

  useEffect(() => {
    if (videoRef.current && currentClip?.url) {
      const clipTime = currentTime - currentClip.startTime;
      if (Math.abs(videoRef.current.currentTime - clipTime) > 0.5) {
        videoRef.current.currentTime = clipTime;
      }
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentTime, isPlaying, currentClip]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-preview-bg rounded-lg overflow-hidden">
      <div className="flex-1 flex items-center justify-center bg-black relative min-h-[300px]">
        {currentClip?.url ? (
          <video
            ref={videoRef}
            src={currentClip.url}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-muted-foreground text-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8" />
            </div>
            <p>Add media to timeline to preview</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onSeek(0)}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            onClick={onPlayPause}
            className="w-12 h-12 rounded-full"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onSeek(duration)}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <span className="text-xs text-muted-foreground w-16">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 60}
            step={0.01}
            onValueChange={([value]) => onSeek(value)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-16 text-right">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
