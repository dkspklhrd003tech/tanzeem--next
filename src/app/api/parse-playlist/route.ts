import { NextResponse } from "next/server";
import { parseVideoInput } from "@/lib/video-parser";

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
          },
        });
        const html = await res.text();

        // Extract video IDs and titles from ytInitialData
        const initialDataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/window\["ytInitialData"\] = ({.*?});/s);

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
                const rawTitle = renderer.title?.runs?.[0]?.text || renderer.title?.simpleText || `Video ${vId}`;
                parsedVideos.push({
                  title: rawTitle,
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

        // Fallback regex scan for watch?v= if ytInitialData parse was empty
        if (parsedVideos.length === 0) {
          const videoIdMatches = Array.from(html.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g));
          const seen = new Set<string>();

          for (const m of videoIdMatches) {
            const vId = m[1];
            if (!seen.has(vId)) {
              seen.add(vId);
              parsedVideos.push({
                title: `YouTube Video (${vId})`,
                videoUrl: `https://www.youtube.com/watch?v=${vId}`,
                embedUrl: `https://www.youtube.com/embed/${vId}?rel=0`,
                thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
              });
            }
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
          let title = `Video ${i + 1}`;
          // Generate nice fallback title if single YouTube link
          const ytSingle = line.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
          if (ytSingle && ytSingle[1]) {
            title = `YouTube Video ${ytSingle[1]}`;
          } else if (line.includes("ok.ru")) {
            title = `OK.ru Video ${i + 1}`;
          } else if (line.includes("rumble")) {
            title = `Rumble Video ${i + 1}`;
          }

          parsedVideos.push({
            title,
            videoUrl: parsed.videoUrl || line,
            embedUrl: parsed.embedSrc || parsed.videoUrl || line,
            thumbnailUrl: parsed.thumbnailUrl || "",
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
