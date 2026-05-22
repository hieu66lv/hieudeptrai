import { useState, useEffect } from 'react';
import { 
  Tv, Search, Eye, Radio, AlertTriangle, Play, HelpCircle, Inbox, 
  Sparkles, Check, AlertCircle, Trash2, Folder
} from 'lucide-react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import ChannelModal from './components/ChannelModal';
import { Channel } from './types';

// Định nghĩa dữ liệu demo ban đầu
const DEMO_CHANNELS: Channel[] = [
  {
    id: 'demo1',
    name: 'Demo Sport Live',
    link: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'sports',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    views: 1250,
    order: 0
  },
  {
    id: 'demo2',
    name: 'Demo Cinema Stream',
    link: 'https://test-streams.mux.dev/master.m3u8',
    category: 'entertainment',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=120&q=80',
    views: 890,
    order: 1
  },
  {
    id: 'demo3',
    name: 'Sintel Bunny HD (Hoạt Họa)',
    link: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    category: 'kids',
    logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=120&q=80',
    views: 2435,
    order: 2
  },
  {
    id: 'demo4',
    name: 'Tears of Steel Sci-Fi',
    link: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    category: 'entertainment',
    logo: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=120&q=80',
    views: 654,
    order: 3
  }
];

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState<'viewer' | 'admin'>('viewer');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  // Search & Filter (Viewer Page)
  const [viewerSearchQuery, setViewerSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [channelToDeleteId, setChannelToDeleteId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Load channels on mount
  useEffect(() => {
    const rawData = localStorage.getItem('liveStreamChannels');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData) as Channel[];
        if (parsed && parsed.length > 0) {
          // Bảo đảm có trường order
          const formatted = parsed.map((ch, idx) => ({
            ...ch,
            order: typeof ch.order === 'number' ? ch.order : idx,
            views: typeof ch.views === 'number' ? ch.views : 0
          }));
          const sorted = formatted.sort((a, b) => a.order - b.order);
          setChannels(sorted);
          if (sorted.length > 0) {
            setCurrentChannel(sorted[0]);
          }
        } else {
          setChannels(DEMO_CHANNELS);
          setCurrentChannel(DEMO_CHANNELS[0]);
          localStorage.setItem('liveStreamChannels', JSON.stringify(DEMO_CHANNELS));
        }
      } catch (err) {
        console.error('Lỗi khôi phục localStorage:', err);
        setChannels(DEMO_CHANNELS);
        setCurrentChannel(DEMO_CHANNELS[0]);
      }
    } else {
      setChannels(DEMO_CHANNELS);
      setCurrentChannel(DEMO_CHANNELS[0]);
      localStorage.setItem('liveStreamChannels', JSON.stringify(DEMO_CHANNELS));
    }
  }, []);

  // Show Toast
  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Save changes to state & localStorage
  const updateChannelsList = (newChannelsList: Channel[]) => {
    // Sắp xếp lại thứ tự order chuẩn xác
    const sorted = newChannelsList.map((ch, idx) => ({ ...ch, order: idx }));
    setChannels(sorted);
    localStorage.setItem('liveStreamChannels', JSON.stringify(sorted));
  };

  // Select Channel and Increment view
  const handleSelectChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    
    // Tăng view
    const updated = channels.map(ch => {
      if (ch.id === channel.id) {
        return { ...ch, views: (ch.views || 0) + 1 };
      }
      return ch;
    });
    updateChannelsList(updated);
  };

  // Create & Edit Channel
  const handleSaveChannel = (channelData: Omit<Channel, 'id' | 'views' | 'order'> & { id?: string }) => {
    if (channelData.id) {
      // Chế độ Edit
      const updated = channels.map(ch => {
        if (ch.id === channelData.id) {
          return {
            ...ch,
            name: channelData.name,
            link: channelData.link,
            category: channelData.category,
            logo: channelData.logo,
          };
        }
        return ch;
      });
      updateChannelsList(updated);
      
      // Update Trình Phát nếu là kênh đang phát
      if (currentChannel && currentChannel.id === channelData.id) {
        setCurrentChannel({
          ...currentChannel,
          name: channelData.name,
          link: channelData.link,
          category: channelData.category,
          logo: channelData.logo,
        });
      }
      triggerToast('Đã cập nhật kênh phát sóng thành công!');
    } else {
      // Chế độ Add mới
      const newChannel: Channel = {
        id: 'chan_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        name: channelData.name,
        link: channelData.link,
        category: channelData.category,
        logo: channelData.logo,
        views: 0,
        order: channels.length,
      };

      const updated = [...channels, newChannel];
      updateChannelsList(updated);
      
      // Trở về kênh vừa tạo nếu chưa có kênh nào
      if (!currentChannel) {
        setCurrentChannel(newChannel);
      }
      triggerToast('Đã thêm kênh m3u8 mới thành công!');
    }
    
    setIsModalOpen(false);
    setEditingChannel(null);
  };

  // Trigger Delete Dialog
  const handleDeleteChannel = (channelId: string) => {
    setChannelToDeleteId(channelId);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!channelToDeleteId) return;

    const filtered = channels.filter(ch => ch.id !== channelToDeleteId);
    updateChannelsList(filtered);

    // Xử lý nếu xóa trúng kênh đang phát
    if (currentChannel && currentChannel.id === channelToDeleteId) {
      setCurrentChannel(filtered.length > 0 ? filtered[0] : null);
    }
    triggerToast('Đã xóa kênh khỏi hệ thống!', 'danger');
    setIsDeleteModalOpen(false);
    setChannelToDeleteId(null);
  };

  // Reorder Channels (Up/Down)
  const handleReorderChannels = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === channels.length - 1) return;

    const newChannels = [...channels];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newChannels[index];
    newChannels[index] = newChannels[targetIdx];
    newChannels[targetIdx] = temp;

    updateChannelsList(newChannels);
    triggerToast('Đã cập nhật thứ tự kênh mượt mà!');
  };

  // Preview Channel from Admin Panel
  const handlePreviewChannel = (channel: Channel) => {
    handleSelectChannel(channel);
    setActiveTab('viewer');
    triggerToast(`Đang trình chiếu: ${channel.name}`);
  };

  // Filter channels on Viewer sidebar
  const viewerFilteredChannels = channels
    .filter(ch => {
      const matchSearch = ch.name.toLowerCase().includes(viewerSearchQuery.toLowerCase());
      return matchSearch;
    });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'viewer' ? (
          // Tab XEM KÊNH
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Sidebar Trái: Danh sách kênh */}
            <aside className="lg:col-span-1 bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[750px] lg:sticky lg:top-24">
              
              {/* Header Sidebar */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-950/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                    Danh Sách Kênh
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-800/80 text-[10px] text-zinc-400 font-bold border border-zinc-700/80 rounded-full">
                    {channels.length} kênh
                  </span>
                </div>

                {/* Tìm kiếm kênh */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm tên kênh nhanh..."
                    value={viewerSearchQuery}
                    onChange={(e) => setViewerSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-all duration-250"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-650 absolute left-3 top-3" />
                </div>
              </div>

              {/* Danh sách kênh cuộn */}
              <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-850/30 max-h-[500px] lg:max-h-none">
                {viewerFilteredChannels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                    <Inbox className="w-10 h-10 text-zinc-700 mb-2" />
                    <p className="text-xs font-semibold">Không tìm thấy kênh</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Hãy thử đổi danh mục hoặc từ khóa khác.</p>
                  </div>
                ) : (
                  viewerFilteredChannels.map(ch => {
                    const isActive = currentChannel?.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChannel(ch)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left my-0.5 group shrink-0 ${
                          isActive
                            ? 'bg-indigo-600/15 border border-indigo-500/20 text-white shadow-inner'
                            : 'hover:bg-zinc-800/40 text-zinc-350 hover:text-zinc-150 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {/* Logo */}
                          <div className="w-9 h-9 bg-zinc-950 border border-zinc-850/80 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
                            {ch.logo ? (
                              <img 
                                src={ch.logo} 
                                alt={ch.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Tv className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                            )}
                            {isActive && <div className="absolute inset-0 bg-indigo-500/10" />}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <span className={`block text-xs font-bold truncate ${isActive ? 'text-indigo-400' : 'text-zinc-200'}`}>
                              {ch.name}
                            </span>
                          </div>
                        </div>

                        {/* View Indicator */}
                        <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-zinc-500 font-bold">
                          <Eye className="w-3 h-3 text-zinc-650" />
                          {ch.views}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Content Phải: Video Player & Metadata */}
            <section className="lg:col-span-3 flex flex-col gap-4">
              <VideoPlayer 
                channel={currentChannel} 
                onRefresh={() => {
                  // Gọi lại luồng từ localStorage
                  if (currentChannel) {
                    const match = channels.find(c => c.id === currentChannel.id);
                    if (match) setCurrentChannel(match);
                  }
                }} 
              />
            </section>
          </div>
        ) : (
          // Tab QUẢN TRỊ
          <AdminPanel 
            channels={channels}
            onOpenAddModal={() => {
              setEditingChannel(null);
              setIsModalOpen(true);
            }}
            onEditChannel={(ch) => {
              setEditingChannel(ch);
              setIsModalOpen(true);
            }}
            onDeleteChannel={handleDeleteChannel}
            onReorderChannels={handleReorderChannels}
            onPreviewChannel={handlePreviewChannel}
          />
        )}
      </main>

      {/* Channel Modal (Thêm/Sửa kênh) */}
      <ChannelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChannel(null);
        }}
        onSave={handleSaveChannel}
        editChannel={editingChannel}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setChannelToDeleteId(null);
            }}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-805 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle className="w-6 h-6 animate-bounce" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-100">Xác nhận xóa kênh</h3>
                <p className="text-zinc-400 text-sm mt-2">
                  Bạn có chắc chắn muốn xóa kênh <span className="font-bold text-rose-400">"{channels.find(ch => ch.id === channelToDeleteId)?.name}"</span> khỏi danh sách không? Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setChannelToDeleteId(null);
                  }}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-semibold rounded-xl text-sm transition-all duration-200 border border-zinc-750"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-rose-600/30"
                >
                  Xóa kênh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400' 
              : 'bg-zinc-900 border-rose-500/30 text-rose-400'
          }`}>
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-sm font-semibold text-zinc-250 select-none">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-6 text-center text-xs text-zinc-650 bg-zinc-950">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <span>HLS Live Stream Portal &copy; 2026</span>
          <span className="hidden sm:inline text-zinc-800">|</span>
          <span className="flex items-center gap-1 text-zinc-500">
            Tận hưởng phát m3u8 cực đỉnh cùng với React & HLS.js
          </span>
        </div>
      </footer>
    </div>
  );
}
