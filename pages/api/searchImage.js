import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    try {
        // Construct a search query for DuckDuckGo HTML Lite (easy to parse, no JS required)
        // or Bing images which has a predictable structure.
        // We will use a simple yahoo image search which is heavily SSR and easy to scrape.
        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&first=1&FORM=IARRTH`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        if (!response.ok) {
            throw new Error(`Search request failed with status ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.select ? cheerio.load(html) : cheerio.load(html);

        let imgUrl = null;

        $('a.iusc').each((i, el) => {
            if (imgUrl) return;

            try {
                // Bing stores the original high-res image URL in a JSON string inside the 'm' attribute
                const mData = $(el).attr('m');
                if (mData) {
                    const parsed = JSON.parse(mData);
                    if (parsed && parsed.murl && parsed.murl.startsWith('http')) {
                        imgUrl = parsed.murl;
                    }
                }
            } catch (err) {
                // Ignore parse errors on individual elements
            }
        });

        // Fallback to the thumbnail src if we couldn't parse the high-res murl
        if (!imgUrl) {
            $('img.mimg').each((i, el) => {
                if (imgUrl) return;

                const src = $(el).attr('src') || $(el).attr('data-src');

                if (src && src.startsWith('http')) {
                    imgUrl = src;
                }
            });
        }

        if (imgUrl) {
            return res.status(200).json({ url: imgUrl });
        } else {
            // Fallback placeholder if scraping fails to find an image
            return res.status(200).json({ url: `https://loremflickr.com/400/300/construction` });
        }

    } catch (error) {
        console.error('Image search proxy error:', error);
        return res.status(500).json({ message: 'Error fetching image', error: error.message });
    }
}
