import { useRef } from 'react';
import { EditorSidebar } from './EditorSidebar';
import { MediaLibrary } from './MediaLibrary';
import { VideoPreview } from './VideoPreview';
import { Timeline } from './Timeline';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const VideoEditor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('media');
  
  const {
    mediaItems,
    tracks,
    currentTime,
    isPlaying,
    duration,
    zoom,
    draggedMedia,
    addMedia,
    deleteMedia,
    addClipToTimeline,
    moveClip,
    deleteClip,
    togglePlayPause,
    seek,
    setZoom,
    setDraggedMedia,
  } = useVideoEditor();

  const handleAddMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addMedia(e.target.files);
      toast.success(`Added ${e.target.files.length} file(s) to media library`);
    }
  };

  const handleExport = () => {
    toast.info('Export feature will use ffmpeg.wasm - Coming soon!');
  };

  const allClips = tracks.flatMap(t => t.clips);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">▶</span>
          </div>
          <span className="font-medium">Video Editor</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <EditorSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onAddMedia={handleAddMedia}
        />
        
        {/* Media panel */}
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <MediaLibrary
            mediaItems={mediaItems}
            onDragStart={setDraggedMedia}
            onDelete={deleteMedia}
          />
        </div>

        {/* Preview area */}
        <div className="flex-1 flex flex-col p-4">
          <VideoPreview
            clips={allClips}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onSeek={seek}
            duration={duration}
          />
        </div>
      </div>

      {/* Timeline */}
      <Timeline
        tracks={tracks}
        currentTime={currentTime}
        duration={duration}
        zoom={zoom}
        onZoomChange={setZoom}
        onTimeChange={seek}
        onClipMove={moveClip}
        onClipDelete={deleteClip}
        onDropMedia={addClipToTimeline}
        draggedMedia={draggedMedia}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
