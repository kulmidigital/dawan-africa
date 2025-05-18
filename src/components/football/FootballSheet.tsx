'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Football from './Football'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FootballSheetProps {
  children: React.ReactNode
}

const FootballSheet: React.FC<FootballSheetProps> = ({ children }) => {
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [competitionName, setCompetitionName] = useState<string | null>(null)

  // Get competition name from ID
  const getCompetitionName = (id: string) => {
    const competitions = {
      'premier-league': 'Premier League',
      'laliga': 'La Liga',
      'serie-a': 'Serie A',
      'bundesliga': 'Bundesliga',
      'ligue-1': 'Ligue 1',
      'champions-league': 'UEFA Champions League',
      'europa-league': 'Europa League',
      'conference-league': 'Europa Conference League',
      'saudi-pro-league': 'Saudi Pro League',
      'mls': 'USA Major League Soccer',
    }
    return competitions[id as keyof typeof competitions] || ''
  }

  const handleSelectCompetition = (id: string) => {
    setSelectedCompetition(id)
    setCompetitionName(getCompetitionName(id))
  }

  const handleBackToList = () => {
    setSelectedCompetition(null)
    setCompetitionName(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when sheet is closed
      setSelectedCompetition(null)
      setCompetitionName(null)
    }
  }

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="lg:min-w-[40vw] min-w-[95vw] p-0 overflow-hidden h-screen flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center">
            {selectedCompetition && (
              <Button variant="ghost" size="icon" className="mr-2 -ml-2" onClick={handleBackToList}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <SheetTitle>
                {selectedCompetition ? competitionName : 'Football Standings'}
              </SheetTitle>
              <SheetDescription>
                {selectedCompetition
                  ? 'Latest standings and results'
                  : 'Select a competition to view standings'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <div className="px-4 pt-3 -mt-3 h-full overflow-auto">
            <Football
              selectedCompetition={selectedCompetition}
              onSelectCompetition={handleSelectCompetition}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default FootballSheet
