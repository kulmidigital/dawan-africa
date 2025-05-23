'use client'

import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react'

export interface AudioTrack {
  id: string
  title: string
  artist?: string
  src: string
  duration?: number
  thumbnail?: string
  articleSlug?: string
}

interface AudioPlayerContextType {
  // Current track state
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean

  // Player visibility
  isPlayerVisible: boolean
  isMinimized: boolean

  // Player controls
  setCurrentTrack: (track: AudioTrack) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void

  // Player UI controls
  showPlayer: () => void
  hidePlayer: () => void
  toggleMinimize: () => void

  // Audio element ref
  audioRef: React.RefObject<HTMLAudioElement | null>

  // Update functions
  updateCurrentTime: (time: number) => void
  updateDuration: (duration: number) => void
  setIsPlaying: (playing: boolean) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}

interface AudioPlayerProviderProps {
  children: ReactNode
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrackState] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlayingState] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlayerVisible, setIsPlayerVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const setCurrentTrack = useCallback(
    (track: AudioTrack) => {
      setCurrentTrackState(track)
      setCurrentTime(0)
      setDuration(0)
      if (!isPlayerVisible) {
        setIsPlayerVisible(true)
      }
    },
    [isPlayerVisible],
  )

  const play = useCallback(async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play()
        setIsPlayingState(true)
      } catch (error) {
        console.error('Error playing audio:', error)
      }
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingState(false)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume))
      setVolumeState(clampedVolume)
      if (audioRef.current) {
        audioRef.current.volume = clampedVolume
      }
      if (clampedVolume > 0 && isMuted) {
        setIsMuted(false)
      }
    },
    [isMuted],
  )

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      audioRef.current.muted = newMutedState
    }
  }, [isMuted])

  const showPlayer = useCallback(() => {
    setIsPlayerVisible(true)
  }, [])

  const hidePlayer = useCallback(() => {
    setIsPlayerVisible(false)
    pause()
  }, [pause])

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev)
  }, [])

  const updateCurrentTime = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const updateDuration = useCallback((dur: number) => {
    setDuration(dur)
  }, [])

  const setIsPlaying = useCallback((playing: boolean) => {
    setIsPlayingState(playing)
  }, [])

  const value: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isPlayerVisible,
    isMinimized,
    setCurrentTrack,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    showPlayer,
    hidePlayer,
    toggleMinimize,
    audioRef,
    updateCurrentTime,
    updateDuration,
    setIsPlaying,
  }

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>
}
