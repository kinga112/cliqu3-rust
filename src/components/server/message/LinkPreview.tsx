import React from 'react';
import { XEmbed, YouTubeEmbed, TikTokEmbed, PinterestEmbed, FacebookEmbed } from 'react-social-media-embed';
// import { Spotify } from 'react-spotify-embed'

// function LinkPreview(props: {url: string}){
interface LinkPreviewProps {
  url: string;
}

// Memoized functional component using React.memo
// const LinkPreview: React.FC<LinkPreviewProps> = React.memo(({ url }) => {
const LinkPreview: React.FC<LinkPreviewProps> = React.memo(({ url }) => {
  if(url.includes('open.spotify.com/')){
    const code = url.split('open.spotify.com/')[1]
    const embedUrl = `https://open.spotify.com/embed/${code}?utm_source=generator`

    if(url.includes('/album/')){
      return(
        <>
          <iframe className='rounded-xl max-w-96 h-[calc(400px)]'
            src={embedUrl}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"/>
        </>
      )
    }else{
      return(
        <>
          <iframe className='rounded-xl left-0 max-w-96 h-20 relative' 
            src={embedUrl}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"/>
        </>
      );
    }
  }else if(url.includes('youtube.com/')){
    return(
      <>
        <div className='flex justify-start'>
          <YouTubeEmbed url={url} width={600} height={338} />
        </div>
      </>
    );
  }else if(url.includes('x.com')){
    return(
      <>
        <div className='flex justify-start'>
          <XEmbed url={url} width={350}/>
        </div>
      </>
    )
  }else if(url.includes('tiktok.com')){
    return(
      <>
        <div className='flex justify-start'>
          <TikTokEmbed url={url} width={325} />
        </div>
      </>
    )
  }else if(url.includes('facebook.com')){
    return(
      <>
        <div className='flex justify-start'>
          <FacebookEmbed url={url} width={550} />
        </div>
      </>
    )
  }else if(url.includes('pinterest.com')){
    const regex = /\d{10,}/
    const id = url.match(regex)
    
    return(
      <>
        <div className='flex justify-start'>
          <PinterestEmbed 
            url={`https://www.pinterest.com/pin/${id}/`}
            height={500}
          />
        </div>
      </>
    )
  }else{
    return(
      <>
        <div></div>
      </>
    )
  }
});

export default LinkPreview;
