import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, RotateCw, Maximize, Volume2, VolumeX, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { Channel } from '../types';

interface VideoPlayerProps {
  channel: Channel | null;
  onRefresh: () => void;
}

export default function VideoPlayer({ channel, onRefresh }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    // Reset States
    setErrorMsg(null);
    setIsLoading(true);
    setIsPlaying(false);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.link;

    const initHls = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 5,
        });

        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Auto-play was prevented (browser policy - requires user interaction or mute)
              setIsPlaying(false);
            });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn('Fatal HLS error:', data.type);
            setIsLoading(false);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setErrorMsg('Lỗi kết nối mạng luồng phát livestream. Đang thử kết nối lại...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setErrorMsg('Lỗi định dạng giải mã hình ảnh. Đang sửa luồng...');
                hls.recoverMediaError();
                break;
              default:
                setErrorMsg('Không thể phát luồng này. Vui lòng kiểm tra lại link .m3u8!');
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });

        const handleNativeError = () => {
          setIsLoading(false);
          setErrorMsg('Lỗi phát luồng trên trình duyệt Safari.');
        };
        video.addEventListener('error', handleNativeError);

        return () => {
          video.removeEventListener('error', handleNativeError);
        };
      } else {
        setIsLoading(false);
        setErrorMsg('Trình duyệt của bạn không hỗ trợ phát luồng HLS m3u8.');
      }
    };

    // Small delay to ensure smooth loading transitions
    const timer = setTimeout(initHls, 150);

    return () => {
      clearTimeout(timer);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, retryCount]);

  // Sync Video States
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Track Fullscreen State
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error('Lỗi kích hoạt toàn màn hình:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleManualRefresh = () => {
    setRetryCount(prev => prev + 1);
    onRefresh();
  };

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800/80 rounded-2xl p-12 text-center h-[450px]">
        <Play className="w-16 h-16 text-zinc-600 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-zinc-100">Chọn một kênh để bắt đầu</h3>
        <p className="text-zinc-400 max-w-sm mt-2 text-sm">
          Nhấn vào bất kỳ kênh nào từ danh sách bên trái để thưởng thức luồng phát trực tiếp.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Container của Player */}
      <div 
        ref={containerRef} 
        className="relative aspect-video w-full bg-black rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl group"
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
            <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-3" />
            <span className="text-zinc-200 text-sm font-medium">Đang kết nối luồng live...</span>
          </div>
        )}

        {/* Error Overlay */}
        {errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-20">
            <AlertCircle className="w-14 h-14 text-rose-500 mb-4 animate-bounce" />
            <h4 className="text-lg font-bold text-zinc-100">Lỗi phát sóng</h4>
            <p className="text-zinc-400 text-sm max-w-md mt-1 mb-4">{errorMsg}</p>
            <button 
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30"
            >
              <RotateCw className="w-4 h-4" />
              Thử Lại Luồng Phát
            </button>
          </div>
        )}

        {/* Custom Video Controls (chỉ hiện khi di chuột qua hoặc trong fullscreen) */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 cubic-bezier(0.4, 0, 0.2, 1) via-black/40 to-transparent p-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          
          <div className="flex items-center justify-between">
            {/* Vế bên trái: Play/Pause, Âm lượng */}
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="text-white hover:text-indigo-400 transition-colors duration-200"
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button 
                onClick={handleManualRefresh}
                className="text-zinc-300 hover:text-indigo-400 transition-colors duration-200"
                title="Tải lại luồng"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-indigo-400 transition-colors duration-200"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-450 transition-all duration-200"
                />
              </div>
            </div>

            {/* Vế bên phải: Trạng thái LIVE, Fullscreen */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-600/90 text-[10px] uppercase font-bold tracking-wider rounded text-white animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                Trực Tiếp
              </div>
              <button 
                onClick={toggleFullScreen}
                className="text-white hover:text-indigo-400 transition-colors duration-200"
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
