'use client';

import { useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Lecture } from '@/types';
import { saveProgress, completeLecture } from '@/lib/api/progress';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

const SAVE_INTERVAL_MS = 10_000;
const COMPLETE_THRESHOLD = 0.9;

interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

interface VideoPlayerProps {
  lecture: Lecture;
  onLectureComplete?: (lectureId: number) => void;
  onEnded?: () => void;
}

export default function VideoPlayer({ lecture, onLectureComplete, onEnded }: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);
  const currentTimeRef = useRef(0);

  const { isPlaying, setIsPlaying, setPlayedSeconds, setDuration, markLectureCompleted } =
    usePlayerStore();
  const { user } = useAuthStore();

  // Reset on lecture change
  useEffect(() => {
    completedRef.current = false;
    currentTimeRef.current = 0;
  }, [lecture.id]);

  // Auto-save every 10 seconds while playing (use ref instead of player.getCurrentTime)
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(async () => {
        const currentTime = currentTimeRef.current;
        if (currentTime <= 0) return;
        try {
          await saveProgress(lecture.id, user?.id ?? 1, Math.floor(currentTime));
        } catch {
          // silently ignore save errors
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
    async (state: ProgressState) => {
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

  const handleDuration = useCallback(
    (duration: number) => {
      setDuration(duration);
    },
    [setDuration]
  );

  const handleReady = useCallback(() => {
    if (lecture.lastPosition && lecture.lastPosition > 0) {
      try {
        playerRef.current?.seekTo(lecture.lastPosition, 'seconds');
      } catch {
        // ignore if seekTo not available
      }
    }
  }, [lecture.lastPosition]);

  return (
    <div className="w-full bg-black">
      <div className="relative aspect-video">
        <ReactPlayer
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
          onDuration={handleDuration}
          onReady={handleReady}
          progressInterval={1000}
          config={{
            youtube: { playerVars: { modestbranding: 1 } },
            file: { attributes: { controlsList: 'nodownload' } },
          }}
        />
      </div>
    </div>
  );
}
