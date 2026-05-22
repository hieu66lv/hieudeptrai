import { useState } from 'react';
import { 
  Tv, Plus, Search, Eye, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink, 
  HelpCircle, Trash, Play, BarChart3, Radio, Database
} from 'lucide-react';
import { Channel } from '../types';

interface AdminPanelProps {
  channels: Channel[];
  onOpenAddModal: () => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
  onReorderChannels: (index: number, direction: 'up' | 'down') => void;
  onPreviewChannel: (channel: Channel) => void;
}

export default function AdminPanel({
  channels,
  onOpenAddModal,
  onEditChannel,
  onDeleteChannel,
  onReorderChannels,
  onPreviewChannel
}: AdminPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Thống kê bento-stats
  const totalChannels = channels.length;
  const totalViews = channels.reduce((acc, current) => acc + (current.views || 0), 0);
  
  // Lọc kênh theo tìm kiếm
  const filteredChannels = [...channels]
    .sort((a, b) => a.order - b.order)
    .filter(ch => {
      const matchSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ch.link.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Stat 1: Tổng kênh */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/20 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="flex flex-col gap-1">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tổng Số Kênh</span>
            <span className="text-4xl font-black text-zinc-100 font-mono tracking-tight">{totalChannels}</span>
            <span className="text-zinc-500 text-[11px] font-medium mt-1">Lưu trữ trên thiết bị</span>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Stat 2: Kênh đang hoạt động */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="flex flex-col gap-1">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Trạng Thái Kết Nối</span>
            <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">{totalChannels > 0 ? 'ONLINE' : 'OFFLINE'}</span>
            <span className="text-zinc-500 text-[11px] font-medium mt-1">Sẵn sàng phát m3u8</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Tổng lượt xem */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/20 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="flex flex-col gap-1">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tổng Lượt Xem</span>
            <span className="text-4xl font-black text-purple-400 font-mono tracking-tight">{totalViews.toLocaleString()}</span>
            <span className="text-zinc-500 text-[11px] font-medium mt-1">Lượt xem tích lũy</span>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar (Search, Add Button) */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên kênh, link stream..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-650 focus:border-indigo-500 focus:outline-none transition-all duration-200"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/35"
        >
          <Plus className="w-4 h-4" />
          Thêm Kênh Mới
        </button>
      </div>

      {/* Table hoặc Empty State */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <HelpCircle className="w-14 h-14 text-zinc-700 mb-4 animate-bounce" />
            <h4 className="text-lg font-bold text-zinc-200">Không tìm thấy kênh phù hợp</h4>
            <p className="text-zinc-500 text-sm max-w-md mt-1 mb-6">
              Vui lòng thử từ khóa tìm kiếm khác hoặc thêm kênh mới vào hệ thống danh sách.
            </p>
            {searchQuery ? (
              <button 
                onClick={() => { setSearchQuery(''); }}
                className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs transition-colors border border-zinc-750"
              >
                Xóa Bộ Lọc
              </button>
            ) : (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-xl text-xs transition-all duration-200"
              >
                Thêm Kênh Đầu Tiên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-850">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest w-12 text-center">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest w-24">Logo</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tên Kênh</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Link Phát (.m3u8)</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest w-28 text-center">Lượt Xem</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest w-16 text-center">Thứ tự</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest w-36 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/80">
                {filteredChannels.map((ch, index) => {
                  const globalIndex = channels.findIndex(c => c.id === ch.id);
                  const isFirst = globalIndex === 0;
                  const isLast = globalIndex === channels.length - 1;

                  return (
                    <tr key={ch.id} className="hover:bg-zinc-950/20 group transition-colors duration-150">
                      
                      {/* Số thứ tự */}
                      <td className="px-6 py-4 text-center font-mono text-zinc-500 font-semibold text-xs">
                        {index + 1}
                      </td>

                      {/* Logo */}
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-indigo-950/50 border border-indigo-900/30 rounded-lg flex items-center justify-center overflow-hidden">
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
                            <Tv className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                      </td>

                      {/* Tên Kênh */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors block text-sm">
                          {ch.name}
                        </span>
                      </td>

                      {/* Link Stream */}
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500 max-w-[200px] truncate select-all" title={ch.link}>
                        {ch.link}
                      </td>

                      {/* Lượt Xem */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-zinc-400 font-bold">
                          <Eye className="w-3.5 h-3.5 text-zinc-600" />
                          {ch.views.toLocaleString()}
                        </div>
                      </td>

                      {/* Thay đổi thứ tự bằng Nút bấm Up/Down mượt mà */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            disabled={isFirst}
                            onClick={() => onReorderChannels(globalIndex, 'up')}
                            className={`p-1 rounded transition-colors ${
                              isFirst 
                                ? 'text-zinc-700 cursor-not-allowed' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            disabled={isLast}
                            onClick={() => onReorderChannels(globalIndex, 'down')}
                            className={`p-1 rounded transition-colors ${
                              isLast 
                                ? 'text-zinc-700 cursor-not-allowed' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Thao tác Sửa/Xóa/Xem Thử */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onPreviewChannel(ch)}
                            className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-950/40 rounded-lg border border-indigo-950/20 hover:border-indigo-805 transition-all duration-200"
                            title="Chạy xem thử"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => onEditChannel(ch)}
                            className="p-2 text-amber-400 hover:text-white hover:bg-amber-950/40 rounded-lg border border-amber-950/20 hover:border-amber-805 transition-all duration-200"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteChannel(ch.id)}
                            className="p-2 text-rose-450 hover:text-white hover:bg-rose-950/40 rounded-lg border border-rose-950/20 hover:border-rose-805 transition-all duration-200"
                            title="Xóa kênh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
