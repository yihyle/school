'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Lecture } from '@/types';
import { saveProgress, completeLecture } from '@/lib/api/progress';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';

const SAVE_INTERVAL_MS = 10_000;
const COMPLETE_THRESHOLD = 0.9;

interface VideoPlayerProps {
  lecture: Lecture;
  onLectureComplete?: (lectureId: number) => void;
  onEnded?: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: typeof YT;
  }
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ lecture, onLectureComplete, onEnded }: VideoPlayerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setIsPlaying, setPlayedSeconds, setDuration, markLectureCompleted } = usePlayerStore();
  const { user } = useAuthStore();

  const videoId = getYouTubeId(lecture.videoUrl);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    const loadAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve();
          return;
        }
        const existing = document.getElementById('youtube-iframe-api');
        if (!existing) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prev) prev();
          resolve();
        };
      });
    };

    loadAPI().then(() => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerRef.current!, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          start: lecture.lastPosition && lecture.lastPosition > 0 ? lecture.lastPosition : 0,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onEnded?.();
            }
          },
        },
      });
    });

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, lecture.id]);

  // Reset on lecture change
  useEffect(() => {
    completedRef.current = false;
  }, [lecture.id]);

  // Progress tracking interval
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;

      try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        setPlayedSeconds(currentTime);

        if (duration > 0) {
          const progress = currentTime / duration;

          // Auto-save
          if (currentTime > 0) {
            await saveProgress(lecture.id, user?.id ?? 1, Math.floor(currentTime));
          }

          // Auto-complete
          if (!completedRef.current && progress >= COMPLETE_THRESHOLD) {
            completedRef.current = true;
            await completeLecture(lecture.id, user?.id ?? 1);
            markLectureCompleted(lecture.id);
            onLectureComplete?.(lecture.id);
          }
        }
      } catch {
        // ignore
      }
    }, SAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lecture.id, user?.id, markLectureCompleted, onLectureComplete, setPlayedSeconds]);

  if (!videoId) {
    return (
      <div className="w-full bg-black">
        <div className="relative aspect-video flex items-center justify-center">
          <p className="text-white">지원하지 않는 영상 URL입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black">
      <div className="relative aspect-video">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
