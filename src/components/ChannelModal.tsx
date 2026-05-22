import React, { useState, useEffect } from 'react';
import { X, Tv, Link, Image, Save } from 'lucide-react';
import { Channel } from '../types';

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (channelData: Omit<Channel, 'id' | 'views' | 'order'> & { id?: string }) => void;
  editChannel: Channel | null;
}

export default function ChannelModal({ isOpen, onClose, onSave, editChannel }: ChannelModalProps) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [logo, setLogo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editChannel) {
      setName(editChannel.name);
      setLink(editChannel.link);
      setLogo(editChannel.logo || '');
    } else {
      setName('');
      setLink('');
      setLogo('');
    }
    setErrorMsg('');
  }, [editChannel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedLink = link.trim();
    const trimmedLogo = logo.trim();

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập tên kênh.');
      return;
    }

    if (!trimmedLink) {
      setErrorMsg('Vui lòng nhập link stream.');
      return;
    }

    if (!trimmedLink.startsWith('http://') && !trimmedLink.startsWith('https://')) {
      setErrorMsg('Đường dẫn link stream phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    onSave({
      id: editChannel?.id,
      name: trimmedName,
      link: trimmedLink,
      category: 'general',
      logo: trimmedLogo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-950/40">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-500" />
            {editChannel ? 'Sửa Kênh Phát Sóng' : 'Thêm Kênh Phát Mới'}
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 p-1.5 rounded-lg transition-all duration-250"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-5">
            {errorMsg && (
              <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Tên Kênh */}
            <div className="flex flex-col gap-2">
              <label htmlFor="modal-channel-name" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                Tên Kênh
              </label>
              <input
                id="modal-channel-name"
                type="text"
                placeholder="Ví dụ: VTV3 HD, K+ Sport..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 font-medium focus:border-indigo-500 focus:outline-none transition-all duration-200 text-sm"
                required
              />
            </div>

            {/* Link Stream */}
            <div className="flex flex-col gap-2">
              <label htmlFor="modal-channel-link" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Link className="w-3.5 h-3.5 text-indigo-400" />
                Link Stream (.m3u8)
              </label>
              <input
                id="modal-channel-link"
                type="url"
                placeholder="https://example.com/live/playlist.m3u8"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 font-medium focus:border-indigo-500 focus:outline-none transition-all duration-200 text-sm"
                required
              />
              <span className="text-[11px] text-zinc-500 italic">
                Hỗ trợ định dạng HLS Live Stream trực tiếp (.m3u8, .mpd, .ts)
              </span>
            </div>

            {/* Logo URL */}
            <div className="flex flex-col gap-2">
              <label htmlFor="modal-channel-logo" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Image className="w-3.5 h-3.5 text-indigo-400" />
                Đường dẫn Logo / Thumbnail (Tùy chọn)
              </label>
              <input
                id="modal-channel-logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 font-medium focus:border-indigo-500 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-850 bg-zinc-950/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-semibold rounded-xl text-sm transition-all duration-200 border border-zinc-750"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
