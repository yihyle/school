'use client';

import { useRef, useEffect } from 'react';
import type { Lecture } from '@/types';
import { saveProgress, completeLecture } from '@/lib/api/progress';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';

const SAVE_INTERVAL_MS = 10_000;
const COMPLETE_THRESHOLD = 0.9;

interface Props {
  lecture: Lecture;
  onLectureComplete?: (lectureId: number) => void;
  onEnded?: () => void;
}

export default function HtmlVideoPlayer({ lecture, onLectureComplete, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  const { setIsPlaying, setPlayedSeconds, setDuration, markLectureCompleted } = usePlayerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    completedRef.current = false;
  }, [lecture.id]);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const currentTime = video.currentTime;
        const duration = video.duration;
        setPlayedSeconds(currentTime);

        if (duration > 0) {
          const progress = currentTime / duration;
          if (currentTime > 0) {
            await saveProgress(lecture.id, user?.id ?? 1, Math.floor(currentTime));
          }
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

  return (
    <div
      className="relative aspect-video w-full overflow-hidden bg-black"
      style={{ maxHeight: 'calc(100vh - 280px)', maxWidth: 'calc((100vh - 280px) * 16 / 9)' }}
    >
      <video
        ref={videoRef}
        src={lecture.videoUrl}
        controls
        className="absolute inset-0 w-full h-full"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (lecture.lastPosition && lecture.lastPosition > 0) {
            e.currentTarget.currentTime = lecture.lastPosition;
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />
    </div>
  );
}
