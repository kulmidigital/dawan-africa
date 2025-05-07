import { getPayload } from "payload"
import { importConfig } from "payload/node"
import { parse } from '@wordpress/block-serialization-default-parser'
import fs from 'fs'
import { XMLParser } from "fast-xml-parser"
import cheerio from 'cheerio'
import path from 'path'
import { createHeadlessEditor } from '@lexical/headless' // <= make sure this package is installed
import {
    getEnabledNodes,
    sanitizeServerEditorConfig,
    defaultEditorConfig
} from '@payloadcms/richtext-lexical'

import { $generateNodesFromDOM } from '@lexical/html'
import { $getRoot,$getSelection } from 'lexical'
import { JSDOM } from 'jsdom';


const categoryMap = {
    "Recent News": "681b4559bf22b4f03457eddf",
    "News": "681b4517bf22b4f03457eda6",
    "Popular News": "681b4545bf22b4f03457edcc",
    "Opinion": "681b452dbf22b4f03457edb9",
    "Features": "681b44febf22b4f03457ed93",
};


(async () => {
    console.log('Starting migration')
    
    const awaitedConfig = await importConfig('./src/payload.config.ts')
    const payload = await getPayload({ config: awaitedConfig })
    const yourEditorConfig = defaultEditorConfig
    
    const headlessEditor = createHeadlessEditor({
        nodes: getEnabledNodes({
            editorConfig: await sanitizeServerEditorConfig(yourEditorConfig, awaitedConfig),
        }),
    })

    function getRootImageUrl(url) {
        const urlObj = new URL(url);
        const fileName = path.basename(urlObj.pathname);
        const newFileName = fileName.replace(/-\d+x\d+(?=\.\w+$)/, ''); // Remove the size part
        urlObj.pathname = path.join(path.dirname(urlObj.pathname), newFileName);
        return urlObj.toString();
      }


    const xmlData = fs.readFileSync('./wp-data.xml', 'utf8')

    // const wpData = parse(xmlData)
    const parser = new XMLParser()
    const wpData = parser.parse(xmlData)

    // console.dir(wpData.rss.channel.item)

    for (const blogPost of wpData.rss.channel.item) {
        console.log(blogPost)
        const parsedData = parse(blogPost['content:encoded'])
        // console.log(parsedData)


        // get Author ID
        const authors = await payload.find({
            collection: 'users',
            where: {
                slug: {
                    equals: blogPost['dc:creator']
                }
            }
        })
        const author = authors.docs[0]

        const newBlogPostData = {
            slug: blogPost['wp:post_name'],
            author: author.id,
            name: blogPost.title,
            creationDate: new Date(blogPost.pubDate),
            layout: [],
            categories: Array.isArray(blogPost.category) ? blogPost.category.map(cat => categoryMap[cat]): [categoryMap[blogPost.category]],
        }

        for (const block of parsedData) {


            if (block.blockName === 'core/image') {

                // find image src with cheerio
                const $ = cheerio.load(block.innerHTML)
                const src = $('img').attr('src')
                
                const alt = $('img').attr('alt')
                const rootImageSrc =  getRootImageUrl(src)
                const imageName = rootImageSrc.split('/').pop()
                console.log(`Found image with src: ${rootImageSrc}, alt: ${alt}`)


                const images = await payload.find({
                    collection: 'media',
                    where: {
                        filename: {
                            equals: imageName
                        }
                    }
                })
                const image = images.docs[0]

                newBlogPostData.layout.push({
                    blockType: 'image',
                    image: image.id,
                })

            }

            if (block.blockName === 'core/paragraph' || block.blockName === 'core/heading') {
                // const $ = cheerio.load(block.innerHTML)
                // const text = $('p').text()
                console.log(`Found paragraph with html: ${block.innerHTML}`)

                headlessEditor.update(() => {
                    // In a headless environment you can use a package such as JSDom to parse the HTML string.
                    const dom = new JSDOM(block.innerHTML)
                  
                    // Once you have the DOM instance it's easy to generate LexicalNodes.
                    const nodes = $generateNodesFromDOM(headlessEditor, dom.window.document)
                  
                    // Select the root
                    $getRoot().select()
                  
                    // Insert them at a selection.
                    const selection = $getSelection()
                    selection.insertNodes(nodes)
                  }, { discrete: true })
                  
                  // Do this if you then want to get the editor JSON
                  const editorJSON = headlessEditor.getEditorState().toJSON()

                  // Clear Editor state
                  headlessEditor.update(() => {
                    const root = $getRoot();
                    root.clear();
                
                  }, { discrete: true });
                  

                newBlogPostData.layout.push({
                    blockType: 'richtext',
                    content: editorJSON,
                })
            }

            // Migrate ACF
            const customFieldData = blogPost['wp:postmeta'].find(meta => meta['wp:meta_key'] === 'test_field')['wp:meta_value']
            console.log(customFieldData)

                headlessEditor.update(() => {
                    
                    // In a headless environment you can use a package such as JSDom to parse the HTML string.
                    const dom = new JSDOM(customFieldData)
                  
                    // Once you have the DOM instance it's easy to generate LexicalNodes.
                    const nodes = $generateNodesFromDOM(headlessEditor, dom.window.document)
                  
                    // Select the root
                    $getRoot().select()
                  
                    // Insert them at a selection.
                    const selection = $getSelection()
                    selection.insertNodes(nodes)
                  }, { discrete: true })
                  
                  // Do this if you then want to get the editor JSON
                  const editorJSON = headlessEditor.getEditorState().toJSON()

                  // Clear Editor state
                  headlessEditor.update(() => {
                    const root = $getRoot();
                    root.clear();
                
                  }, { discrete: true });



                newBlogPostData.test_field = editorJSON
        }

        // Create Blog Article
        console.log('creating new')
        await payload.create({
            collection: 'blogPosts',
            data: newBlogPostData
        })

    }

})()