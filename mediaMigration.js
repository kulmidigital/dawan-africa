
import fs from 'fs'
import { XMLParser } from "fast-xml-parser"
import mime from 'mime'
import { getPayload } from 'payload'
import { importConfig } from 'payload/node'






(async () => {

    console.log('Starting migration')
    const awaitedConfig = await importConfig('./src/payload.config.ts')
    const payload = await getPayload({ config: awaitedConfig })
    
    const xmlData = fs.readFileSync('./media.xml', 'utf8')

    // const wpData = parse(xmlData)
    const parser = new XMLParser()
    const wpData = parser.parse(xmlData)

    for (const mediaItem of wpData.rss.channel.item) {
        console.log(mediaItem.guid)

        // fetch file
        const res = await fetch(mediaItem.guid);
        if (!res.ok) {
            console.log(`Skipping ${mediaItem.guid}, failed to fetch`)
            continue;
        }
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(new Uint8Array(arrayBuffer))

        await payload.create({
            collection: 'media',
            data: {
                alt: mediaItem.title,
            },
            file: {
                data: buffer,
                mimetype: mime.getType(mediaItem.guid.split('?')[0].split('/').pop()),
                name: mediaItem.guid.split('?')[0].split('/').pop(),
                size: buffer.length,
            },
        })
    }

})()