'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import {
  FaFacebook,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaEnvelope,
  FaShareAlt,
  FaLink,
  FaSpinner,
} from 'react-icons/fa'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SharePopoverProps {
  title: string
  url: string
  description?: string
  className?: string
  iconSize?: number
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showLabel?: boolean
}

export const SharePopover: React.FC<SharePopoverProps> = ({
  title,
  url,
  description = '',
  className,
  iconSize = 18,
  buttonSize = 'icon',
  buttonVariant = 'outline',
  showLabel = false,
}) => {
  const [isSharing, setIsSharing] = React.useState(false)
  const [shareResult, setShareResult] = React.useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <FaFacebook size={iconSize} />,
      color: 'bg-[#1877F2] text-white hover:bg-[#0C63D4]',
      getLink: () =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    },
    {
      name: 'Twitter',
      icon: <FaTwitter size={iconSize} />,
      color: 'bg-[#1DA1F2] text-white hover:bg-[#0c85d0]',
      getLink: () =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedinIn size={iconSize} />,
      color: 'bg-[#0077B5] text-white hover:bg-[#005582]',
      getLink: () =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={iconSize} />,
      color: 'bg-[#25D366] text-white hover:bg-[#1da851]',
      getLink: () => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      name: 'Email',
      icon: <FaEnvelope size={iconSize} />,
      color: 'bg-gray-600 text-white hover:bg-gray-700',
      getLink: () =>
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
    },
  ]

  const handleNativeShare = async () => {
    setIsSharing(true)
    setShareResult(null)

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description || `Check out this article: ${title}`,
          url,
        })
        setShareResult({ message: 'Shared successfully!', type: 'success' })
        setIsOpen(false)
      } else {
        setShareResult({ message: 'Native sharing not supported', type: 'error' })
      }
    } catch (error) {
      console.error('Error sharing content:', error)
      setShareResult({ message: 'Failed to share', type: 'error' })
    } finally {
      setIsSharing(false)
      // Clear message after 3 seconds
      setTimeout(() => setShareResult(null), 3000)
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    // Prevent any default browser behavior
    e.preventDefault()
    e.stopPropagation()

    setIsSharing(true)
    setShareResult(null)

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Modern clipboard API - preferred method
        await navigator.clipboard.writeText(url)
        setShareResult({ message: 'Link copied!', type: 'success' })
      } else {
        // Fallback for browsers without Clipboard API support
        try {
          const urlToCopy = url

          // Mobile devices often scroll when textarea is used for copying
          // Use a proper styled hidden textarea to minimize this effect
          const textArea = document.createElement('textarea')

          // Style the textarea to be invisible but still functional
          // This prevents the browser from scrolling to it
          textArea.style.position = 'fixed'
          textArea.style.top = '0'
          textArea.style.left = '0'
          textArea.style.width = '2em'
          textArea.style.height = '2em'
          textArea.style.padding = '0'
          textArea.style.border = 'none'
          textArea.style.outline = 'none'
          textArea.style.boxShadow = 'none'
          textArea.style.background = 'transparent'
          textArea.style.opacity = '0'
          textArea.style.zIndex = '-1'
          textArea.setAttribute('readonly', '')
          textArea.setAttribute('aria-hidden', 'true')

          textArea.value = urlToCopy
          document.body.appendChild(textArea)

          try {
            textArea.focus()
            textArea.select()


            const successful = document.execCommand('copy')
            if (successful) {
              setShareResult({ message: 'Link copied!', type: 'success' })
            } else {
              // If execCommand fails, show the URL to user
              setShareResult({
                message: 'Copy this URL manually',
                type: 'error',
              })
              // As a last resort, show a prompt with the URL
              setTimeout(() => {
                window.prompt('Copy to clipboard: Ctrl+C, Enter', urlToCopy)
              }, 500)
            }
          } catch (err) {
            console.error('Fallback copy method failed:', err)
            setShareResult({ message: 'Copy this URL manually', type: 'error' })
            // As a last resort, show a prompt with the URL
            setTimeout(() => {
              window.prompt('Copy to clipboard: Ctrl+C, Enter', urlToCopy)
            }, 500)
          } finally {
            // Ensure we remove the element whether it worked or not
            document.body.removeChild(textArea)
          }
        } catch (fallbackError) {
          console.error('All clipboard methods failed:', fallbackError)
          setShareResult({
            message: 'Please copy URL from address bar',
            type: 'error',
          })
        }
      }
    } catch (error) {
      console.error('Error copying link:', error)
      setShareResult({ message: 'Failed to copy link', type: 'error' })
    } finally {
      setIsSharing(false)
      // Clear message after 3 seconds
      setTimeout(() => setShareResult(null), 3000)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn('relative', className)}
          aria-label="Share"
        >
          <FaShareAlt className="h-4 w-4" />
          {showLabel && <span>Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Share this article</h3>

          {/* Native share button (mainly for mobile) */}
          <Button
            className="w-full mb-2 bg-primary hover:bg-primary/90 text-white"
            onClick={handleNativeShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <FaSpinner className="h-4 w-4 animate-spin" />
            ) : (
              <FaShareAlt className="h-4 w-4" />
            )}
            <span>Share</span>
          </Button>

          <div className="flex flex-wrap gap-2 justify-between">
            {shareLinks.map((socialLink) => (
              <a
                key={socialLink.name}
                href={socialLink.getLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('rounded-full p-2 transition-colors', socialLink.color)}
                aria-label={`Share on ${socialLink.name}`}
              >
                {socialLink.icon}
              </a>
            ))}

            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={isSharing}
              aria-label="Copy link"
              type="button"
            >
              <FaLink size={iconSize} />
            </Button>
          </div>

          {shareResult && (
            <p
              className={cn(
                'text-xs mt-2 text-center',
                shareResult.type === 'success' ? 'text-green-600' : 'text-red-600',
              )}
            >
              {shareResult.message}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
