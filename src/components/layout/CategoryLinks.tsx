'use client'

import React from 'react'
import Link from 'next/link'
import { BlogCategory } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import FootballSheet from '@/components/football/FootballSheet'
import { BiCoin, BiGlobe, BiChevronDown, BiDotsHorizontalRounded } from 'react-icons/bi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

interface CategoryLinksProps {
  categories: BlogCategory[]
  countries: string[]
  onCountrySelect: (country: string) => void
  isMobile?: boolean
  onLinkClick?: () => void
}

const prioritizedCategoryNames: string[] = [
  'Politics',
  'Business',
  'Opinion',
  'Sports',
  'Culture & Living',
  'Explainers',
]

const MAX_VISIBLE_DYNAMIC_CATEGORIES_DESKTOP = 7

const CategoryLinks: React.FC<CategoryLinksProps> = ({
  categories,
  countries,
  onCountrySelect,
  isMobile = false,
  onLinkClick,
}) => {
  const handleMobileLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  const renderLink = (
    href: string,
    text: string,
    icon?: React.ReactNode,
    isButton = !isMobile,
    key?: string,
  ) => {
    const commonClasses = isMobile
      ? 'px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6] block'
      : 'text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md'

    const content = icon ? (
      <span className="flex items-center">
        {icon}
        {text}
      </span>
    ) : (
      text
    )

    if (isButton && !isMobile) {
      return (
        <Button key={key} variant="ghost" asChild className={commonClasses}>
          <Link href={href} onClick={handleMobileLinkClick}>
            {content}
          </Link>
        </Button>
      )
    }
    return (
      <Link
        key={key}
        href={href}
        className={`${commonClasses} ${icon && isMobile ? 'flex items-center' : ''}`}
        onClick={handleMobileLinkClick}
      >
        {content}
      </Link>
    )
  }

  const renderCategoryLinkNode = (category: BlogCategory, forMobile: boolean) => {
    return renderLink(
      `/categories/${category.id}`,
      category.name,
      undefined,
      !forMobile,
      category.id,
    )
  }

  const renderCountriesForMobile = () => {
    return (
      <div key="mobile-countries" className="flex flex-col space-y-1 pt-2 pb-1">
        <DropdownMenuLabel className="px-3 text-xs font-normal text-gray-500">
          Countries
        </DropdownMenuLabel>
        {countries.map((country) => (
          <button
            key={country}
            onClick={() => {
              onCountrySelect(country)
              handleMobileLinkClick()
            }}
            className="text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
          >
            {country}
          </button>
        ))}
      </div>
    )
  }

  const renderFootball = () => {
    if (isMobile) {
      return (
        <FootballSheet key="mobile-football">
          <button
            onClick={handleMobileLinkClick}
            className="text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6] w-full flex items-center"
          >
            Football
          </button>
        </FootballSheet>
      )
    }
    return (
      <FootballSheet key="desktop-football">
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md"
        >
          Football
        </Button>
      </FootballSheet>
    )
  }

  const orderedDynamicCategoriesData: BlogCategory[] = []
  const processedCategoryIds = new Set<string>()

  prioritizedCategoryNames.forEach((name) => {
    const category = categories.find((cat) => cat.name === name)
    if (category && !processedCategoryIds.has(category.id)) {
      orderedDynamicCategoriesData.push(category)
      processedCategoryIds.add(category.id)
    }
  })

  categories.forEach((category) => {
    if (!processedCategoryIds.has(category.id)) {
      orderedDynamicCategoriesData.push(category)
    }
  })

  if (isMobile) {
    const mobileDynamicCategoryLinks = orderedDynamicCategoriesData.map((cat) =>
      renderCategoryLinkNode(cat, true),
    )
    return (
      <>
        {renderLink('/news', 'All News', undefined, false, 'mobile-all-news')}

        <div className="pt-2 pb-1 border-t mt-2" key="mobile-news-categories-header">
          <DropdownMenuLabel className="px-3 text-xs font-normal text-gray-500">
            News Categories
          </DropdownMenuLabel>
          {orderedDynamicCategoriesData.length === 0 &&
            categories.length > 0 &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`mobile-cat-skeleton-${i}`} className="h-10 w-full rounded-md mt-1" />
            ))}
          {orderedDynamicCategoriesData.length === 0 &&
            categories.length === 0 &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={`mobile-no-cat-skeleton-${i}`}
                className="h-10 w-full rounded-md mt-1"
              />
            ))}
          {mobileDynamicCategoryLinks}
        </div>

        <Separator className="my-2" />

        {renderLink(
          '/markets',
          'Markets',
          <BiCoin className="h-4 w-4 mr-2" />,
          false,
          'mobile-markets',
        )}

        <Separator className="my-2" />

        {renderCountriesForMobile()}

        <Separator className="my-2" />

        {renderFootball()}

        <Separator className="my-2" />

        {renderLink('/podcasts', 'Podcasts', undefined, false, 'mobile-podcasts')}
        {renderLink('/photos-archives', 'Photos & Archives', undefined, false, 'mobile-photos')}
      </>
    )
  }

  // Desktop view
  const visibleDynamicCategories = orderedDynamicCategoriesData.slice(
    0,
    MAX_VISIBLE_DYNAMIC_CATEGORIES_DESKTOP,
  )
  const overflowDynamicCategories = orderedDynamicCategoriesData.slice(
    MAX_VISIBLE_DYNAMIC_CATEGORIES_DESKTOP,
  )

  const desktopVisibleDynamicLinks = visibleDynamicCategories.map((cat) =>
    renderCategoryLinkNode(cat, false),
  )

  return (
    <>
      {renderLink('/', 'Home', undefined, true, 'desktop-home')}
      {renderLink('/news', 'All News', undefined, true, 'desktop-all-news')}

      {desktopVisibleDynamicLinks}

      {overflowDynamicCategories.length > 0 && (
        <DropdownMenu key="desktop-more-dropdown">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md flex items-center gap-1"
            >
              More
              <BiDotsHorizontalRounded className="h-4 w-4 ml-1 opacity-75" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            <DropdownMenuLabel>More Links</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {overflowDynamicCategories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link
                  href={`/categories/${category.id}`}
                  className="text-gray-700 hover:text-[#2aaac6]"
                >
                  {category.name}
                </Link>
              </DropdownMenuItem>
            ))}

            {overflowDynamicCategories.length > 0 && <DropdownMenuSeparator />}

            <DropdownMenuItem key="more-markets" asChild>
              <Link
                href="/markets"
                className="text-gray-700 hover:text-[#2aaac6] flex items-center"
              >
                <BiCoin className="w-4 h-4 mr-2" /> Markets
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSub key="more-countries">
              <DropdownMenuSubTrigger className="text-gray-700 hover:text-[#2aaac6] data-[state=open]:bg-accent data-[state=open]:text-accent-foreground justify-start">
                <BiGlobe className="w-4 h-4 mr-2" /> Countries
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Select Country</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country}
                    onClick={() => onCountrySelect(country)}
                    className="cursor-pointer"
                  >
                    {country}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {orderedDynamicCategoriesData.length === 0 &&
        categories.length === 0 &&
        Array.from({ length: MAX_VISIBLE_DYNAMIC_CATEGORIES_DESKTOP }).map((_, i) => (
          <Skeleton key={`desktop-no-cat-skeleton-${i}`} className="h-9 w-20 rounded-md" />
        ))}

      {!(overflowDynamicCategories.length > 0) && (
        <>
          {renderLink(
            '/markets',
            'Markets',
            <BiCoin className="w-4 h-4 mr-1" />,
            true,
            'desktop-markets',
          )}
          <DropdownMenu key="desktop-countries-direct">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md flex items-center gap-1"
              >
                <BiGlobe className="w-4 h-4 mr-1" />
                Countries
                <BiChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              <DropdownMenuLabel>Select Country</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {countries.map((country) => (
                <DropdownMenuItem
                  key={country}
                  onClick={() => onCountrySelect(country)}
                  className="cursor-pointer"
                >
                  {country}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {renderFootball()}
      {renderLink('/podcasts', 'Podcasts', undefined, true, 'desktop-podcasts')}
      {renderLink('/photos-archives', 'Photos & Archives', undefined, true, 'desktop-photos')}
    </>
  )
}

export default CategoryLinks
