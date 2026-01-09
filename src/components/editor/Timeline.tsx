import { useRef, useState, useCallback } from 'react';
import { Track, TimelineClip, MediaItem } from '@/types/editor';
import { cn } from '@/lib/utils';
import { Video, Music, Type, ZoomIn, ZoomOut, Scissors, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineProps {
  tracks: Track[];
  currentTime: number;
  duration: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onTimeChange: (time: number) => void;
  onClipMove: (clipId: string, newStartTime: number, newTrackIndex: number) => void;
  onClipDelete: (clipId: string) => void;
  onDropMedia: (media: MediaItem, trackType: 'video' | 'audio', time: number) => void;
  draggedMedia: MediaItem | null;
}

export const Timeline = ({
  tracks,
  currentTime,
  duration,
  zoom,
  onZoomChange,
  onTimeChange,
  onClipMove,
  onClipDelete,
  onDropMedia,
  draggedMedia,
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const pixelsPerSecond = 50 * zoom;
  const timelineWidth = Math.max(duration * pixelsPerSecond, 800);

  const formatTimeMarker = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = x / pixelsPerSecond;
    onTimeChange(Math.max(0, Math.min(time, duration)));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, trackType: 'video' | 'audio') => {
      e.preventDefault();
      if (!draggedMedia || !timelineRef.current) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = x / pixelsPerSecond;
      
      onDropMedia(draggedMedia, trackType, Math.max(0, time));
    },
    [draggedMedia, pixelsPerSecond, onDropMedia]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
    }
  };

  const timeMarkers = [];
  const interval = zoom < 0.5 ? 10 : zoom < 1 ? 5 : 2;
  for (let i = 0; i <= duration; i += interval) {
    timeMarkers.push(i);
  }

  return (
    <div className="h-64 bg-timeline-bg border-t border-border flex flex-col">
      {/* Timeline toolbar */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Scissors className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8"
            onClick={() => selectedClip && onClipDelete(selectedClip)}
            disabled={!selectedClip}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8"
            onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8"
            onClick={() => onZoomChange(Math.min(4, zoom + 0.25))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track labels */}
        <div className="w-32 flex-shrink-0 border-r border-border">
          <div className="h-6 border-b border-border" />
          {tracks.map((track) => (
            <div 
              key={track.id} 
              className="h-16 flex items-center gap-2 px-3 border-b border-border text-sm"
            >
              <span className={cn(
                track.type === 'video' && 'text-primary',
                track.type === 'audio' && 'text-timeline-audio',
                track.type === 'text' && 'text-accent'
              )}>
                {getTrackIcon(track.type)}
              </span>
              <span className="truncate">{track.name}</span>
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative"
          onClick={handleTimelineClick}
        >
          <div style={{ width: timelineWidth, minWidth: '100%' }}>
            {/* Time ruler */}
            <div className="h-6 relative border-b border-border bg-card/50">
              {timeMarkers.map((time) => (
                <div
                  key={time}
                  className="absolute top-0 h-full flex flex-col items-center"
                  style={{ left: time * pixelsPerSecond }}
                >
                  <span className="text-[10px] text-muted-foreground">{formatTimeMarker(time)}</span>
                  <div className="flex-1 w-px bg-border" />
                </div>
              ))}
            </div>

            {/* Tracks */}
            {tracks.map((track, trackIndex) => (
              <div
                key={track.id}
                className="h-16 relative border-b border-border"
                onDrop={(e) => handleDrop(e, track.type as 'video' | 'audio')}
                onDragOver={handleDragOver}
              >
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={cn(
                      'timeline-clip',
                      clip.type === 'video' && 'timeline-clip-video',
                      clip.type === 'audio' && 'timeline-clip-audio',
                      clip.type === 'text' && 'timeline-clip-text',
                      selectedClip === clip.id && 'ring-2 ring-white'
                    )}
                    style={{
                      left: clip.startTime * pixelsPerSecond,
                      width: clip.duration * pixelsPerSecond,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClip(clip.id);
                    }}
                  >
                    <div className="h-full flex items-center px-2 overflow-hidden">
                      {clip.thumbnail && clip.type === 'video' && (
                        <div className="flex h-full py-1 gap-1">
                          {Array.from({ length: Math.ceil(clip.duration * pixelsPerSecond / 60) }).map((_, i) => (
                            <img 
                              key={i}
                              src={clip.thumbnail} 
                              alt="" 
                              className="h-full w-auto object-cover rounded-sm opacity-80"
                            />
                          ))}
                        </div>
                      )}
                      {clip.type === 'audio' && (
                        <div className="flex items-center gap-1 h-full w-full">
                          <div className="flex items-end h-8 gap-px flex-1">
                            {Array.from({ length: Math.min(50, Math.ceil(clip.duration * 5)) }).map((_, i) => (
                              <div 
                                key={i}
                                className="flex-1 bg-timeline-audio/60 rounded-t"
                                style={{ height: `${20 + Math.random() * 80}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-2 text-[10px] truncate max-w-[80%] bg-black/50 px-1 rounded">
                        {clip.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Playhead */}
            <div 
              className="playhead"
              style={{ left: currentTime * pixelsPerSecond }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
