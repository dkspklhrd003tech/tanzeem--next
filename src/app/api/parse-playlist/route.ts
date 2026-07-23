import { NextResponse } from "next/server";
import { parseVideoInput } from "@/lib/video-parser";

// Helper to fetch actual YouTube title via oEmbed if HTML regex missing
async function fetchYtOembedTitle(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      return data.title || null;
    }
  } catch (err) {
    // ignore
  }
  return null;
}

// Helper to fetch OK.ru video details (title + thumbnail) via oEmbed or meta tag parsing
async function getOkRuVideoDetails(okId: string): Promise<{ title: string | null; thumbnailUrl: string | null }> {
  try {
    const oembedUrl = `https://ok.ru/dk?cmd=oembed&url=https://ok.ru/video/${okId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const title = data.title ? data.title.trim() : null;
      const thumbnailUrl = data.thumbnail_url || data.author_url || null;
      if (title || thumbnailUrl) {
        return { title, thumbnailUrl };
      }
    }
  } catch (err) {
    console.warn("OK.ru oEmbed fetch failed:", err);
  }

  try {
    const res = await fetch(`https://ok.ru/video/${okId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const ogImage =
        html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i)?.[1] ||
        html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i)?.[1] ||
        html.match(/<link\s+rel=["']image_src["']\s+href=["'](.*?)["']/i)?.[1];

      const ogTitle =
        html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i)?.[1] ||
        html.match(/<title>(.*?)<\/title>/i)?.[1];

      const cleanTitle = ogTitle
        ? ogTitle
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'")
            .replace(/\s*::\s*Одноклассники.*/i, "")
            .trim()
        : null;

      return {
        title: cleanTitle || null,
        thumbnailUrl: ogImage ? ogImage.replace(/&amp;/g, "&") : null,
      };
    }
  } catch (err) {
    console.warn("OK.ru HTML fetch failed:", err);
  }

  return { title: null, thumbnailUrl: null };
}

export async function POST(req: Request) {
  try {
    const { playlistUrl } = await req.json();

    if (!playlistUrl || typeof playlistUrl !== "string") {
      return NextResponse.json({ success: false, error: "Playlist URL or video links required." }, { status: 400 });
    }

    const input = playlistUrl.trim();
    const parsedVideos: Array<{
      title: string;
      videoUrl: string;
      embedUrl: string;
      thumbnailUrl: string;
    }> = [];

    // 1. YouTube Playlist Detection
    const ytPlaylistMatch = input.match(/(?:youtube\.com\/(?:playlist|watch)\?.*list=)([a-zA-Z0-9_-]+)/i);

    if (ytPlaylistMatch && ytPlaylistMatch[1]) {
      const playlistId = ytPlaylistMatch[1];
      try {
        const fetchUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
        const res = await fetch(fetchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9,ur;q=0.8",
          },
        });
        const html = await res.text();

        // Extract video items from ytInitialData
        const initialDataMatch =
          html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
          html.match(/window\["ytInitialData"\] = ({.*?});/s);

        if (initialDataMatch && initialDataMatch[1]) {
          try {
            const data = JSON.parse(initialDataMatch[1]);
            const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
            let playlistContents: any[] = [];

            for (const tab of tabs) {
              const contents = tab?.tabRenderer?.content?.sectionListRenderer?.contents;
              if (contents) {
                for (const content of contents) {
                  const items = content?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
                  if (items) {
                    playlistContents = items;
                    break;
                  }
                }
              }
            }

            for (const item of playlistContents) {
              const renderer = item.playlistVideoRenderer;
              if (renderer && renderer.videoId) {
                const vId = renderer.videoId;
                let rawTitle =
                  renderer.title?.runs?.[0]?.text ||
                  renderer.title?.simpleText ||
                  renderer.title?.accessibility?.accessibilityData?.label?.split(" by ")[0];

                parsedVideos.push({
                  title: rawTitle || "",
                  videoUrl: `https://www.youtube.com/watch?v=${vId}`,
                  embedUrl: `https://www.youtube.com/embed/${vId}?rel=0`,
                  thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
                });
              }
            }
          } catch (jsonErr) {
            console.warn("Failed to parse ytInitialData JSON:", jsonErr);
          }
        }

        // Fallback regex scan for videoId + title pairs in HTML
        if (parsedVideos.length === 0) {
          const videoTitleMatches = Array.from(
            html.matchAll(
              /"playlistVideoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"[^}]*?"title":\{"runs":\[\{"text":"([^"]+)"\}/g
            )
          );
          const seen = new Set<string>();

          for (const m of videoTitleMatches) {
            const vId = m[1];
            const title = m[2];
            if (!seen.has(vId)) {
              seen.add(vId);
              parsedVideos.push({
                title: title || `YouTube Video (${vId})`,
                videoUrl: `https://www.youtube.com/watch?v=${vId}`,
                embedUrl: `https://www.youtube.com/embed/${vId}?rel=0`,
                thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
              });
            }
          }

          // Secondary regex scan if videoTitleMatches was empty
          if (parsedVideos.length === 0) {
            const videoIdMatches = Array.from(html.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g));
            for (const m of videoIdMatches) {
              const vId = m[1];
              if (!seen.has(vId)) {
                seen.add(vId);
                parsedVideos.push({
                  title: "",
                  videoUrl: `https://www.youtube.com/watch?v=${vId}`,
                  embedUrl: `https://www.youtube.com/embed/${vId}?rel=0`,
                  thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
                });
              }
            }
          }
        }

        // Fill missing titles using parallel oEmbed calls (batch size 10)
        const missingTitleIndexes = parsedVideos
          .map((v, i) => (v.title.trim() === "" || v.title.startsWith("YouTube Video (") ? i : -1))
          .filter((i) => i !== -1);

        if (missingTitleIndexes.length > 0) {
          const batchSize = 10;
          for (let i = 0; i < missingTitleIndexes.length; i += batchSize) {
            const batchIdxs = missingTitleIndexes.slice(i, i + batchSize);
            await Promise.all(
              batchIdxs.map(async (idx) => {
                const item = parsedVideos[idx];
                const vId = item.videoUrl.match(/v=([a-zA-Z0-9_-]{11})/)?.[1];
                if (vId) {
                  const fetchedTitle = await fetchYtOembedTitle(vId);
                  if (fetchedTitle) {
                    parsedVideos[idx].title = fetchedTitle;
                  } else {
                    parsedVideos[idx].title = `Video ${idx + 1}`;
                  }
                }
              })
            );
          }
        }
      } catch (ytErr) {
        console.error("YouTube playlist fetch error:", ytErr);
      }
    }

    // 2. Rumble Playlist / Channel Fetching
    else if (input.includes("rumble.com")) {
      try {
        const res = await fetch(input, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        const html = await res.text();

        const videoMatches = Array.from(html.matchAll(/<a[^>]+href="(\/v[a-z0-9]+-[^"]+\.html)"[^>]*>(.*?)<\/a>/gi));
        const seen = new Set<string>();

        for (const m of videoMatches) {
          const relUrl = m[1];
          const fullUrl = `https://rumble.com${relUrl}`;
          if (!seen.has(fullUrl)) {
            seen.add(fullUrl);
            const titleMatch = m[2].replace(/<[^>]+>/g, "").trim();
            const embedMatch = relUrl.match(/\/v([a-z0-9]+)-/i);
            const embedId = embedMatch ? embedMatch[1] : "";

            parsedVideos.push({
              title: titleMatch || "Rumble Video",
              videoUrl: fullUrl,
              embedUrl: embedId ? `https://rumble.com/embed/v${embedId}/` : fullUrl,
              thumbnailUrl: "",
            });
          }
        }
      } catch (rumbleErr) {
        console.error("Rumble playlist fetch error:", rumbleErr);
      }
    }

    // 3. Fallback: Multiline or space/comma-separated video links (YouTube, Rumble, OK.ru, Vimeo, etc.)
    if (parsedVideos.length === 0) {
      const lines = input.split(/[\n\r,]+/).map((s) => s.trim()).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parsed = parseVideoInput(line);
        if (parsed.videoUrl || parsed.embedSrc) {
          let title = "";
          let thumbnailUrl = parsed.thumbnailUrl || "";

          const ytSingle = line.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
          const okSingle = line.match(/ok\.ru\/(?:videoembed|video)\/(\d+)/i);

          if (ytSingle && ytSingle[1]) {
            const fetchedTitle = await fetchYtOembedTitle(ytSingle[1]);
            title = fetchedTitle || `Video ${i + 1}`;
          } else if (okSingle && okSingle[1]) {
            const okData = await getOkRuVideoDetails(okSingle[1]);
            if (okData.title) title = okData.title;
            if (okData.thumbnailUrl) thumbnailUrl = okData.thumbnailUrl;
            if (!title) title = `Video ${i + 1}`;
          } else {
            title = `Video ${i + 1}`;
          }

          parsedVideos.push({
            title,
            videoUrl: parsed.videoUrl || line,
            embedUrl: parsed.embedSrc || parsed.videoUrl || line,
            thumbnailUrl,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: parsedVideos.length,
      videos: parsedVideos,
    });
  } catch (error: any) {
    console.error("Parse playlist error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to parse playlist" }, { status: 500 });
  }
}
