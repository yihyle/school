'use client';

import { create } from 'zustand';
import type { Lecture, Section } from '@/types';

interface PlayerState {
  currentLecture: Lecture | null;
  currentCourseId: number | null;
  sections: Section[];
  isPlaying: boolean;
  playedSeconds: number;
  duration: number;
  completedLectureIds: Set<number>;

  setCurrentLecture: (lecture: Lecture) => void;
  setCurrentCourseId: (courseId: number) => void;
  setSections: (sections: Section[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlayedSeconds: (seconds: number) => void;
  setDuration: (duration: number) => void;
  markLectureCompleted: (lectureId: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentLecture: null,
  currentCourseId: null,
  sections: [],
  isPlaying: false,
  playedSeconds: 0,
  duration: 0,
  completedLectureIds: new Set(),

  setCurrentLecture: (lecture) => set({ currentLecture: lecture }),
  setCurrentCourseId: (courseId) => set({ currentCourseId: courseId }),
  setSections: (sections) => set({ sections }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlayedSeconds: (seconds) => set({ playedSeconds: seconds }),
  setDuration: (duration) => set({ duration }),
  markLectureCompleted: (lectureId) =>
    set((state) => ({
      completedLectureIds: new Set([...state.completedLectureIds, lectureId]),
    })),
  reset: () =>
    set({
      currentLecture: null,
      currentCourseId: null,
      sections: [],
      isPlaying: false,
      playedSeconds: 0,
      duration: 0,
      completedLectureIds: new Set(),
    }),
}));
