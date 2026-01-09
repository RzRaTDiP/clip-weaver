import { MediaItem } from '@/types/editor';
import { Video, Image, Music, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaLibraryProps {
  mediaItems: MediaItem[];
  onDragStart: (item: MediaItem) => void;
  onDelete: (id: string) => void;
}

export const MediaLibrary = ({ mediaItems, onDragStart, onDelete }: MediaLibraryProps) => {
  const getIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-8 h-8" />;
      case 'image':
        return <Image className="w-8 h-8" />;
      case 'audio':
        return <Music className="w-8 h-8" />;
    }
  };

  if (mediaItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No media yet</p>
          <p className="text-xs mt-1">Click + to add media files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Media Library</h3>
      <div className="grid grid-cols-2 gap-2">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => onDragStart(item)}
            className="group relative bg-secondary rounded-lg p-3 cursor-grab hover:bg-secondary/80 transition-colors"
          >
            <div className="aspect-video flex items-center justify-center bg-muted rounded mb-2 overflow-hidden">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className={cn(
                  'text-muted-foreground',
                  item.type === 'video' && 'text-primary',
                  item.type === 'audio' && 'text-timeline-audio',
                  item.type === 'image' && 'text-accent'
                )}>
                  {getIcon(item.type)}
                </div>
              )}
            </div>
            <p className="text-xs truncate">{item.name}</p>
            {item.duration && (
              <p className="text-xs text-muted-foreground">
                {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="absolute top-1 right-1 p-1 rounded bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
