'use client'

import React from 'react'
import FootballSheet from '@/components/football/FootballSheet'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'

export const FootballLeagueButtons = () => {
  const leagues = [
    {
      id: 'premier-league',
      name: 'Premier League',
      icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    { id: 'laliga', name: 'La Liga', icon: '🇪🇸', color: 'bg-red-100 text-red-800 border-red-200' },
    {
      id: 'serie-a',
      name: 'Serie A',
      icon: '🇮🇹',
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      id: 'bundesliga',
      name: 'Bundesliga',
      icon: '🇩🇪',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
      id: 'ligue-1',
      name: 'Ligue 1',
      icon: '🇫🇷',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'champions-league',
      name: 'Champions League',
      icon: '🏆',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'europa-league',
      name: 'Europa League',
      icon: '🥈',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    {
      id: 'saudi-pro-league',
      name: 'Saudi Pro League',
      icon: '🇸🇦',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'mls',
      name: 'MLS',
      icon: '🇺🇸',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
  ]

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="h-5 w-5 text-amber-600" />
          <span className="font-medium text-gray-900">Football Leagues</span>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2 min-w-max">
            {leagues.map((league) => (
              <FootballSheet key={league.id} defaultCompetition={league.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${league.color} hover:scale-105 transition-all duration-200 whitespace-nowrap min-w-fit shadow-sm hover:shadow-md`}
                >
                  <span className="mr-2">{league.icon}</span>
                  {league.name}
                </Button>
              </FootballSheet>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
