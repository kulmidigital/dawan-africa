'use client'

import React from 'react'
import { Media } from '@/payload-types'

interface BlockRendererProps {
  block: any // Using 'any' for now, should be replaced with specific block types
}

const RichTextBlock: React.FC<{ content: any }> = ({ content }) => {
  // Handle Payload CMS's richtext structure which might have text property directly
  // rather than the Lexical structure we expected
  if (typeof content === 'string') {
    return (
      <div
        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Check if content might be stored under a different property name
  const blockContent = content || {}

  // Check if we have text content directly (some Payload configs use this structure)
  if (blockContent.text) {
    return (
      <div
        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: blockContent.text }}
      />
    )
  }

  // Standard Lexical structure
  if (blockContent.root?.children) {
    return (
      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
        {blockContent.root.children.map((child: any, index: number) => {
          if (child.type === 'paragraph') {
            return <p key={index}>{child.children.map((span: any) => span.text).join('')}</p>
          }
          // Add more Lexical node types as needed (headings, lists, etc.)
          return null
        })}
      </div>
    )
  }

  return (
    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
      <p>[Content structure issue - could not render content]</p>
    </div>
  )
}

const ImageBlock: React.FC<{ image: Media | string | null; altText?: string }> = ({
  image,
  altText,
}) => {
  const imageUrl = typeof image === 'string' ? null : image?.url
  const alt = altText || (typeof image === 'string' ? 'Image' : image?.alt || 'Article image')

  if (!imageUrl)
    return (
      <div className="my-4 sm:my-6 md:my-8 text-center text-gray-500">[Image not available]</div>
    )

  return (
    <figure className="my-4 sm:my-6 md:my-8">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-auto rounded-md sm:rounded-lg shadow-sm sm:shadow-md object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[600px]"
      />
      {alt && (
        <figcaption className="text-center text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  )
}

const CoverBlock: React.FC<{
  image?: Media | string | null
  heading?: any
  subheading?: string
}> = ({ image, heading, subheading }) => {
  const imageUrl = typeof image === 'string' ? null : image?.url

  // Simplified heading rendering
  const headingText = heading?.root?.children?.[0]?.children?.[0]?.text || 'Cover Heading'

  return (
    <div className="my-6 sm:my-8 md:my-10 relative aspect-video md:aspect-[16/7] rounded-md sm:rounded-xl overflow-hidden shadow-md sm:shadow-xl min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={headingText}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div
        className={`absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-6 md:p-8 bg-gradient-to-t ${imageUrl ? 'from-black/70 to-transparent' : 'from-gray-800 to-gray-700'}`}
      >
        <h2 className="text-xl sm:text-3xl md:text-5xl font-serif font-bold text-white mb-2 sm:mb-4 drop-shadow-md">
          {headingText}
        </h2>
        {subheading && (
          <p className="text-sm sm:text-base md:text-xl text-gray-200 max-w-2xl drop-shadow-sm">
            {subheading}
          </p>
        )}
      </div>
    </div>
  )
}

// This component will map blockType to the actual rendering component
export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.blockType?.toLowerCase()) {
    case 'richtext':
    case 'richText':
      // Try different property names that Payload CMS might use for rich text content
      const richtextContent = block.content || block.text || block.value || block.richText || block
      return <RichTextBlock content={richtextContent} />
    case 'image':
      return <ImageBlock image={block.image} altText={block.alt} />
    case 'cover':
      return (
        <CoverBlock image={block.image} heading={block.heading} subheading={block.subheading} />
      )
    // Add cases for other block types like 'recentBlogPosts', etc.
    // case 'recentBlogPosts':
    //   return <RecentBlogPostsBlock posts={block.shownPosts} />;
    default:
      return (
        <div className="my-4 p-3 sm:p-4 bg-red-100 border border-red-300 rounded-md text-sm sm:text-base">
          <p className="font-semibold text-red-700">Unsupported block type: {block.blockType}</p>
          <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
            {JSON.stringify(block, null, 2)}
          </pre>
        </div>
      )
  }
}
