'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
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

export default function VideoPlayer({ lecture, onLectureComplete, onEnded }: VideoPlayerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);
  const currentTimeRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [PlayerComponent, setPlayerComponent] = useState<any>(null);

  const { isPlaying, setIsPlaying, setPlayedSeconds, setDuration, markLectureCompleted } =
    usePlayerStore();
  const { user } = useAuthStore();

  // Dynamic import on client only
  useEffect(() => {
    import('react-player').then((mod) => {
      setPlayerComponent(() => mod.default);
    });
  }, []);

  // Reset on lecture change
  useEffect(() => {
    completedRef.current = false;
    currentTimeRef.current = 0;
  }, [lecture.id]);

  // Auto-save every 10 seconds while playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(async () => {
        const currentTime = currentTimeRef.current;
        if (currentTime <= 0) return;
        try {
          await saveProgress(lecture.id, user?.id ?? 1, Math.floor(currentTime));
        } catch {
          // silently ignore
        }
      }, SAVE_INTERVAL_MS);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, lecture.id, user?.id]);

  const handleProgress = useCallback(
    async (state: { played: number; playedSeconds: number }) => {
      currentTimeRef.current = state.playedSeconds;
      setPlayedSeconds(state.playedSeconds);
      if (!completedRef.current && state.played >= COMPLETE_THRESHOLD) {
        completedRef.current = true;
        try {
          await completeLecture(lecture.id, user?.id ?? 1);
          markLectureCompleted(lecture.id);
          onLectureComplete?.(lecture.id);
        } catch {
          // silently ignore
        }
      }
    },
    [lecture.id, user?.id, markLectureCompleted, onLectureComplete, setPlayedSeconds]
  );

  const handleReady = useCallback(() => {
    if (lecture.lastPosition && lecture.lastPosition > 0 && playerRef.current) {
      try {
        playerRef.current.seekTo(lecture.lastPosition, 'seconds');
      } catch {
        // ignore
      }
    }
  }, [lecture.lastPosition]);

  if (!PlayerComponent) {
    return (
      <div className="w-full bg-black">
        <div className="relative aspect-video flex items-center justify-center">
          <div className="text-white text-sm">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black">
      <div className="relative aspect-video">
        <PlayerComponent
          ref={playerRef}
          url={lecture.videoUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
          onProgress={handleProgress}
          onDuration={(d: number) => setDuration(d)}
          onReady={handleReady}
          progressInterval={1000}
          config={{
            youtube: { playerVars: { modestbranding: 1, rel: 0 } },
          }}
        />
      </div>
    </div>
  );
}
