'use client'

import React, { useEffect, useState } from 'react'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import {
  X,
  Minimize2,
  Maximize2,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import Link from 'next/link'

export const FloatingAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlayerVisible,
    isMinimized,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    toggleMinimize,
    hidePlayer,
    audioRef,
    shouldAutoPlayRef,
    updateCurrentTime,
    updateDuration,
    setIsPlaying,
  } = useAudioPlayer()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime)
    }

    const handleDurationChange = () => {
      updateDuration(audio.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleCanPlay = async () => {
      // Auto-play if requested
      if (shouldAutoPlayRef.current) {
        shouldAutoPlayRef.current = false // Reset the flag
        try {
          await audio.play()
        } catch (error) {
          console.error('Auto-play failed:', error)
        }
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)

    // Set the audio source
    audio.src = currentTrack.src

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [currentTrack, audioRef, updateCurrentTime, updateDuration, setIsPlaying, shouldAutoPlayRef])

  // Format time helper
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Progress bar handler
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    seekTo(newTime)
  }

  // Volume bar handler
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setVolume(percent)
  }

  // Skip functions (placeholder for future playlist functionality)
  const handleSkipBack = () => {
    seekTo(Math.max(0, currentTime - 15))
  }

  const handleSkipForward = () => {
    seekTo(Math.min(duration, currentTime + 15))
  }

  // Don't render on server or if no track is loaded
  if (!isMounted || !currentTrack || !isPlayerVisible) {
    return null
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Floating Player */}
      <div
        className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-16 h-16' : 'w-80 sm:w-96'
        }`}
      >
        {isMinimized ? (
          // Minimized view
          <div className="w-full h-full flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 flex items-center justify-center bg-[#2aaac6] hover:bg-[#238ca3] text-white rounded-lg transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button
              onClick={toggleMinimize}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          // Full view
          <div className="p-4">
            {/* Header with controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-[#2aaac6]" />
                <span className="text-xs text-gray-500 font-medium">Now Playing</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleMinimize}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={hidePlayer}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Track info */}
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                {currentTrack.title}
              </h3>
              {currentTrack.artist && (
                <p className="text-xs text-gray-500 mt-1">{currentTrack.artist}</p>
              )}
              {currentTrack.articleSlug && (
                <Link
                  href={`/news/${currentTrack.articleSlug}`}
                  className="text-xs text-[#2aaac6] hover:text-[#238ca3] mt-1 inline-block"
                >
                  View Article →
                </Link>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div
                className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-[#2aaac6] rounded-full transition-all duration-150"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSkipBack}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-gray-600" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 flex items-center justify-center bg-[#2aaac6] hover:bg-[#238ca3] text-white rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={handleSkipForward}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Volume control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <div
                  className="w-16 h-2 bg-gray-200 rounded-full cursor-pointer"
                  onClick={handleVolumeClick}
                >
                  <div
                    className="h-full bg-[#2aaac6] rounded-full transition-all duration-150"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
