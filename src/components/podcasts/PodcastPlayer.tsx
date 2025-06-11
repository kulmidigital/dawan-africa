'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Podcast } from '@/payload-types'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ExternalLink,
  Share2,
  Heart,
  Clock,
  Users,
  Calendar,
  Tag,
  Headphones,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import type { AudioTrack } from '@/contexts/AudioPlayerContext'
import {
  formatDuration,
  getPodcastDisplayTitle,
  getPodcastCoverImage,
  getPodcastAudioUrl,
  getPodcastExcerpt,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface PodcastPlayerProps {
  podcast: Podcast
  showDetails?: boolean
  variant?: 'full' | 'compact'
  className?: string
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  showDetails = true,
  variant = 'full',
  className = '',
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    seekTo,
    setVolume,
    toggleMute,
    isPlayerVisible,
  } = useAudioPlayer()

  const [isExpanded, setIsExpanded] = useState(false)
  const [liked, setLiked] = useState(false)

  const coverImageUrl = getPodcastCoverImage(podcast)
  const audioUrl = getPodcastAudioUrl(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)
  const excerpt = getPodcastExcerpt(podcast, 200)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)
  const categories = podcast.categories

  // Create AudioTrack object
  const audioTrack: AudioTrack | null = audioUrl
    ? {
        id: `podcast-${podcast.id}`,
        title: displayTitle,
        artist: peopleInvolved,
        src: audioUrl,
        duration: podcast.duration || undefined,
        thumbnail: coverImageUrl || undefined,
      }
    : null

  const isCurrentTrack = currentTrack?.id === `podcast-${podcast.id}`
  const progress = duration ? (currentTime / duration) * 100 : 0

  const handlePlayPause = () => {
    if (!audioTrack) return

    if (isCurrentTrack) {
      if (isPlaying) {
        pause()
      } else {
        play()
      }
    } else {
      // Load and play new track
      // This would typically be handled by the AudioPlayer context
      // For now, we'll just play without setting the track
      play()
    }
  }

  const handleSeek = (value: number[]) => {
    if (duration) {
      const newTime = (value[0] / 100) * duration
      seekTo(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (variant === 'compact') {
    return (
      <div
        className={`relative bg-gradient-to-r from-white via-slate-50/50 to-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2aaac6]/5 via-transparent to-[#2aaac6]/5" />

        <div className="relative p-5">
          <div className="flex items-center gap-4">
            {/* Cover Image */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2aaac6]/20 via-[#2aaac6]/10 to-[#2aaac6]/5 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-[#2aaac6]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0 space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                <Link
                  href={`/podcasts/${podcast.slug}`}
                  className="hover:text-[#2aaac6] transition-colors duration-300"
                >
                  {displayTitle}
                </Link>
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {peopleInvolved}
              </p>
              {podcast.duration && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(podcast.duration)}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={!audioTrack}
                className="w-10 h-10 p-0 rounded-full bg-[#2aaac6]/10 hover:bg-[#2aaac6]/20 text-[#2aaac6] transition-all duration-300"
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar for current track */}
          {isCurrentTrack && isPlayerVisible && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500 w-10 text-right">{formatTime(currentTime)}</span>
                <div className="flex-grow">
                  <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="w-full [&_[role=slider]]:bg-[#2aaac6] [&_[role=slider]]:border-[#2aaac6]"
                  />
                </div>
                <span className="text-slate-500 w-10">
                  {duration ? formatTime(duration) : '--:--'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Full player variant
  return (
    <div
      className={`relative bg-white rounded-3xl border-0 shadow-2xl shadow-slate-200/50 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#2aaac6]/5 via-transparent to-slate-50/50" />

      {/* Header with Background */}
      <div className="relative">
        {coverImageUrl && (
          <div className="absolute inset-0 h-32">
            <Image
              src={coverImageUrl}
              alt={displayTitle}
              fill
              className="object-cover opacity-20 blur-sm"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-white" />
          </div>
        )}

        <div className="relative p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#2aaac6]/10 text-[#2aaac6] border-[#2aaac6]/20 font-medium">
                  Podcast Episode
                </Badge>
                {podcast.featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{displayTitle}</h1>

              <div className="flex items-center gap-6 text-slate-600">
                <span className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-[#2aaac6]" />
                  {peopleInvolved}
                </span>

                {podcast.publishedAt && (
                  <span className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#2aaac6]" />
                    {formatTimeAgo(podcast.publishedAt || podcast.createdAt)}
                  </span>
                )}

                {podcast.duration && (
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#2aaac6]" />
                    {formatDuration(podcast.duration)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={`h-10 w-10 rounded-full transition-all duration-300 ${
                  liked
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-[#2aaac6] transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-[#2aaac6] transition-all duration-300"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Categories */}
          {showDetails && categories && Array.isArray(categories) && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) =>
                typeof category === 'object' && category.name ? (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="border-[#2aaac6]/20 text-[#2aaac6] bg-white/80 backdrop-blur-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {category.name}
                  </Badge>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>

      {/* Player Section */}
      <div className="relative p-8 pt-4">
        <div className="flex gap-8">
          {/* Cover Image */}
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-slate-900/20">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={displayTitle}
                fill
                className="object-cover"
                sizes="256px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#2aaac6]/20 via-[#2aaac6]/10 to-[#2aaac6]/5 flex items-center justify-center">
                <Headphones className="w-20 h-20 text-[#2aaac6]" />
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <Button
                onClick={handlePlayPause}
                disabled={!audioTrack}
                className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-[#2aaac6] shadow-2xl transition-all duration-300 hover:scale-110"
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Controls & Info */}
          <div className="flex-grow space-y-8">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 p-0 rounded-full border-2 border-slate-200 hover:border-[#2aaac6] hover:text-[#2aaac6] transition-all duration-300"
                onClick={() => seekTo(Math.max(0, currentTime - 15))}
                disabled={!isCurrentTrack}
              >
                <SkipBack className="w-6 h-6" />
              </Button>

              <Button
                size="lg"
                onClick={handlePlayPause}
                disabled={!audioTrack}
                className="w-20 h-20 p-0 rounded-full bg-gradient-to-br from-[#2aaac6] to-[#1e90a6] hover:from-[#2aaac6]/90 hover:to-[#1e90a6]/90 text-white shadow-2xl shadow-[#2aaac6]/30 hover:scale-105 transition-all duration-300"
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-9 h-9" />
                ) : (
                  <Play className="w-9 h-9 ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 p-0 rounded-full border-2 border-slate-200 hover:border-[#2aaac6] hover:text-[#2aaac6] transition-all duration-300"
                onClick={() => seekTo(Math.min(duration || 0, currentTime + 15))}
                disabled={!isCurrentTrack}
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>

            {/* Progress Bar */}
            {isCurrentTrack && isPlayerVisible && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600 w-14 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-grow">
                    <Slider
                      value={[progress]}
                      onValueChange={handleSeek}
                      max={100}
                      step={0.1}
                      className="w-full h-2 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:bg-[#2aaac6] [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-14">
                    {duration ? formatTime(duration) : '--:--'}
                  </span>
                </div>
              </div>
            )}

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="w-10 h-10 p-0 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#2aaac6] transition-all duration-300"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-[#2aaac6] [&_[role=slider]]:border-[#2aaac6]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {podcast.playCount && podcast.playCount > 0 && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Headphones className="w-4 h-4" />
                    {podcast.playCount.toLocaleString()} plays
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#2aaac6] transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {showDetails && excerpt && (
          <div
            className={`mt-8 pt-8 border-t border-slate-200 transition-all duration-500 ${
              isExpanded ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden pt-0 mt-0 border-t-0'
            }`}
          >
            <div className="max-w-4xl">
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">About this episode</h3>
              <p className="text-slate-700 leading-relaxed text-base">{excerpt}</p>
            </div>
          </div>
        )}

        {/* External Links */}
        {showDetails && podcast.externalLinks && podcast.externalLinks.length > 0 && (
          <div
            className={`mt-8 pt-8 border-t border-slate-200 transition-all duration-500 ${
              isExpanded ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden pt-0 mt-0 border-t-0'
            }`}
          >
            <h3 className="font-semibold text-slate-900 mb-4 text-lg">Resources & Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {podcast.externalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#2aaac6]/30 hover:bg-[#2aaac6]/5 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2aaac6]/10 flex items-center justify-center group-hover:bg-[#2aaac6]/20 transition-colors">
                    <ExternalLink className="w-5 h-5 text-[#2aaac6]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 group-hover:text-[#2aaac6] transition-colors">
                      {link.title}
                    </h4>
                    {link.description && (
                      <p className="text-sm text-slate-600 mt-1">{link.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
