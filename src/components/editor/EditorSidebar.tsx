import { Video, Image, Music, Type, Layers, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'media', icon: Video, label: 'Media' },
  { id: 'canvas', icon: Layers, label: 'Canvas' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'videos', icon: Video, label: 'Videos' },
  { id: 'images', icon: Image, label: 'Images' },
];

interface EditorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddMedia: () => void;
}

export const EditorSidebar = ({ activeTab, onTabChange, onAddMedia }: EditorSidebarProps) => {
  return (
    <div className="w-20 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-2">
      <button
        onClick={onAddMedia}
        className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
      
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            'sidebar-item w-16',
            activeTab === item.id && 'active'
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
