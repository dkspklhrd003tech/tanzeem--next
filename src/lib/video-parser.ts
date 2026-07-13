export function parseVideoInput(input: string) {
  let videoUrl = input;
  let embedSrc = "";
  let thumbnailUrl = "";

  if (!input) return { videoUrl, embedSrc, thumbnailUrl };

  // Check if it's an iframe
  const iframeMatch = input.match(/<iframe.*?src=["'](.*?)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    embedSrc = iframeMatch[1];
    videoUrl = input; 
  }

  const textToSearch = embedSrc || videoUrl;

  // Detect YouTube
  const ytMatch = textToSearch.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    embedSrc = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
    thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    if (!iframeMatch) videoUrl = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  }

  // Detect Vimeo
  const vimeoMatch = textToSearch.match(/vimeo\.com\/(?:video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    if (!iframeMatch) videoUrl = `https://vimeo.com/${vimeoMatch[1]}`;
  }

  // Detect Dailymotion
  const dmMatch = textToSearch.match(/dailymotion\.com\/(?:video\/|embed\/video\/)([a-zA-Z0-9]+)/i) || textToSearch.match(/dai\.ly\/([a-zA-Z0-9]+)/i);
  if (dmMatch && dmMatch[1]) {
    embedSrc = `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
    thumbnailUrl = `https://www.dailymotion.com/thumbnail/video/${dmMatch[1]}`;
    if (!iframeMatch) videoUrl = `https://www.dailymotion.com/video/${dmMatch[1]}`;
  }

  // Detect OK.ru
  const okMatch = textToSearch.match(/ok\.ru\/(?:videoembed|video)\/(\d+)/i);
  if (okMatch && okMatch[1]) {
    embedSrc = `https://ok.ru/videoembed/${okMatch[1]}`;
    if (!iframeMatch) videoUrl = `https://ok.ru/video/${okMatch[1]}`;
  }

  // If no embedSrc generated but input was iframe, use the iframe src
  if (!embedSrc && iframeMatch && iframeMatch[1]) {
     embedSrc = iframeMatch[1];
  }

  return { videoUrl, embedSrc, thumbnailUrl };
}
