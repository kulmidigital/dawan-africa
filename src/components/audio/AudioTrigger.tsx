'use client'

import React from 'react'
import { useAudioPlayer, AudioTrack } from '@/contexts/AudioPlayerContext'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioTriggerProps {
  track: AudioTrack
  variant?: 'button' | 'icon' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
  showTitle?: boolean
}

export const AudioTrigger: React.FC<AudioTriggerProps> = ({
  track,
  variant = 'button',
  size = 'md',
  className = '',
  children,
  showTitle = false,
}) => {
  const { currentTrack, isPlaying, setCurrentTrack, togglePlayPause, showPlayer, play } =
    useAudioPlayer()

  const isCurrentTrack = currentTrack?.id === track.id
  const isCurrentlyPlaying = isCurrentTrack && isPlaying

  const handleClick = () => {
    if (isCurrentTrack) {
      // If it's the same track, just toggle play/pause
      togglePlayPause()
    } else {
      // If it's a different track, set it as current, show player, and start playing
      setCurrentTrack(track)
      showPlayer()
      // Auto-play the new track after a brief delay to ensure it's loaded
      setTimeout(() => {
        play()
      }, 100)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  }

  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center space-x-2 text-[#2aaac6] hover:text-[#238ca3] transition-colors ${className}`}
        title={isCurrentlyPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isCurrentlyPlaying ? (
          <Pause className={iconSizeClasses[size]} />
        ) : (
          <Play className={iconSizeClasses[size]} />
        )}
        {(children || showTitle) && (
          <span className="text-sm font-medium">
            {children || (showTitle ? track.title : 'Listen')}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-[#2aaac6] hover:bg-[#238ca3] text-white rounded-full transition-all hover:scale-105 ${className}`}
        title={isCurrentlyPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isCurrentlyPlaying ? (
          <Pause className={iconSizeClasses[size]} />
        ) : (
          <Play className={`${iconSizeClasses[size]} ml-0.5`} />
        )}
      </button>
    )
  }

  // Default button variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 px-4 py-2 bg-[#2aaac6] hover:bg-[#238ca3] text-white rounded-lg transition-all hover:scale-105 ${className}`}
    >
      <Volume2 className={iconSizeClasses[size]} />
      <span className="text-sm font-medium">
        {children || (isCurrentlyPlaying ? 'Pause' : 'Listen')}
      </span>
      {isCurrentTrack && (
        <div className="flex items-center space-x-1">
          <div
            className={`h-1 w-1 bg-white rounded-full ${isCurrentlyPlaying ? 'animate-pulse' : ''}`}
          />
          <div
            className={`h-1 w-1 bg-white rounded-full ${isCurrentlyPlaying ? 'animate-pulse delay-75' : ''}`}
          />
          <div
            className={`h-1 w-1 bg-white rounded-full ${isCurrentlyPlaying ? 'animate-pulse delay-150' : ''}`}
          />
        </div>
      )}
    </button>
  )
}
