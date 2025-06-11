'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Podcast } from '@/payload-types'
import { Headphones, Play, Pause, Calendar, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  getPodcastDisplayTitle,
  getPodcastCoverImage,
  getPodcastAudioUrl,
  formatPeopleInvolved,
} from '@/utils/podcastUtils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PodcastDetailsSheet } from './PodcastDetailsSheet'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'

interface PodcastCardProps {
  podcast: Podcast
  showCategories?: boolean
  variant?: 'default' | 'compact'
}

// Simple date formatting function
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, variant = 'default' }) => {
  const { setCurrentTrack, currentTrack, isPlaying } = useAudioPlayer()
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const coverImageUrl = getPodcastCoverImage(podcast)
  const audioUrl = getPodcastAudioUrl(podcast)
  const displayTitle = getPodcastDisplayTitle(podcast)
  const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)
  const isCurrentTrack = currentTrack?.id === `podcast-${podcast.id}`

  const handlePlay = () => {
    if (audioUrl) {
      const audioTrack = {
        id: `podcast-${podcast.id}`,
        title: displayTitle,
        artist: peopleInvolved ?? 'Dawan Africa',
        src: audioUrl,
        coverUrl: coverImageUrl,
        duration: podcast.duration ?? 0,
      }
      setCurrentTrack(audioTrack, true)
    }
  }

  if (variant === 'compact') {
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-r from-white via-slate-50/50 to-white border border-slate-200/60 hover:border-[#2aaac6]/30 hover:shadow-xl hover:shadow-[#2aaac6]/10 transition-all duration-500 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2aaac6]/5 via-transparent to-[#2aaac6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="relative p-4">
          <div className="flex items-center gap-4">
            {/* Cover Image */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white group-hover:ring-[#2aaac6]/20 transition-all duration-300">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2aaac6]/30 via-[#2aaac6]/20 to-[#2aaac6]/10 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-[#2aaac6]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {podcast.episodeNumber && (
                  <Badge className="bg-[#2aaac6]/10 text-[#2aaac6] border-[#2aaac6]/20 text-xs">
                    Ep. {podcast.episodeNumber}
                  </Badge>
                )}
                {podcast.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(podcast.publishedAt)}
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm group-hover:text-[#2aaac6] transition-colors duration-300">
                <Link
                  href={`/podcasts/${podcast.slug}`}
                  className="hover:text-[#2aaac6] transition-colors"
                >
                  {displayTitle}
                </Link>
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handlePlay}
                disabled={!audioUrl}
                size="sm"
                className={`w-9 h-9 rounded-lg shadow-lg transition-all duration-300 ${
                  isCurrentTrack && isPlaying
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-gradient-to-r from-[#2aaac6] to-[#2aaac6]/90 text-white hover:from-[#2aaac6]/90 hover:to-[#2aaac6]/80'
                }`}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              <PodcastDetailsSheet
                podcast={podcast}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9 border-[#2aaac6]/20 text-[#2aaac6] hover:bg-[#2aaac6]/10 hover:border-[#2aaac6]/40"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl hover:shadow-[#2aaac6]/20 transition-all duration-700 rounded-2xl p-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2aaac6]/5 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative">
        {/* Cover Image Section */}
        {coverImageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
            <Image
              src={coverImageUrl}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Episode number and date */}
            <div className="absolute top-3 left-3 flex gap-2">
              {podcast.episodeNumber && (
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-md text-xs font-semibold">
                  Episode #{podcast.episodeNumber}
                </Badge>
              )}
            </div>

            {podcast.publishedAt && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-md text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(podcast.publishedAt)}
                </Badge>
              </div>
            )}

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
              <Button
                onClick={handlePlay}
                disabled={!audioUrl}
                className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 ${
                  isCurrentTrack && isPlaying
                    ? 'bg-white text-[#2aaac6] hover:bg-slate-50'
                    : 'bg-gradient-to-r from-[#2aaac6] to-[#2aaac6]/80 text-white hover:from-[#2aaac6]/90 hover:to-[#2aaac6]/70'
                }`}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                <Link
                  href={`/podcasts/${podcast.slug}`}
                  className="hover:text-[#2aaac6] transition-colors duration-300"
                >
                  {displayTitle}
                </Link>
              </h3>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              onClick={handlePlay}
              disabled={!audioUrl}
              className={`flex-1 h-9 font-semibold transition-all duration-300 rounded-lg text-sm ${
                isCurrentTrack && isPlaying
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-gradient-to-r from-[#2aaac6] to-[#2aaac6]/90 hover:from-[#2aaac6]/90 hover:to-[#2aaac6]/80 text-white shadow-lg hover:shadow-xl hover:shadow-[#2aaac6]/30'
              }`}
            >
              {isCurrentTrack && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Playing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>

            <PodcastDetailsSheet
              podcast={podcast}
              open={isDetailOpen}
              onOpenChange={setIsDetailOpen}
              trigger={
                <Button
                  variant="outline"
                  className="h-9 px-3 border-2 border-[#2aaac6]/20 text-[#2aaac6] hover:bg-[#2aaac6]/10 hover:border-[#2aaac6]/40 rounded-lg transition-all duration-300"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
