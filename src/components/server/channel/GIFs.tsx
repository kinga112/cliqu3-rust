import { useEffect, useRef, useState } from "react"
// import { Masonry } from 'react-masonry'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { useUserStore } from "../../../state-management/userStore";
import { KLIPY_API_CODE } from "../../../config";
import { useGlobalStore } from "../../../state-management/globalStore";
import { push } from "../../../push";
import { useServerStore } from "../../../state-management/serverStore";
import { v4 as uuidv4 } from 'uuid';

export default function GIFs(){

  return(
    <>
      <div className="flex flex-col h-full w-full">
        <Nav/>
        <GIFPage/>
      </div>
    </>
  )
}

function Nav(){
  const setCurrentGifNav = useGlobalStore(globals => globals.setCurrentGifNav)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const buttonStyle = 'w-full h-12 bg-deep-purple-300 hover:bg-deep-purple-200 rounded text-lg'

  return (
    <>
      <div className="flex flex-col p-3 gap-2 w-full bg-deep-purple-400">
        <div className="flex justify-between gap-2">
          <button onClick={() => setCurrentGifNav("Recents")} className={buttonStyle}>Recents</button>
          <button onClick={() => setCurrentGifNav("Trending")} className={buttonStyle}>Trending</button>
          <button onClick={() => setCurrentGifNav("Categories")} className={buttonStyle}>Categories</button>
          {/* <button onClick={() => setCurrentGifNav("Search")} className={buttonStyle}>Search</button> */}
        </div>
        <input ref={inputRef} onChange={handleInputChange} className="w-full h-12 p-2 rounded bg-deep-purple-300 text-xl" placeholder="Search"/>
      </div>
    </>
  )
}

function GIFPage(){
  const currentGifNav = useGlobalStore(globals => globals.currentGifNav)
  const address = useUserStore(user => user.address)
  const [gifs, setGifs] = useState([''])
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // const [page, setPage] = useState(1)
  // const page = useGlobalStore(globals => globals.gifPage)
  const setPage = useGlobalStore(globals => globals.setGifPage)
  
  useEffect(() => {
    console.log("GIF PAGE USE EFFECT")
    setGifs([''])
    setPage(1)
    getGifs()
  }, [currentGifNav])

  const handleScroll = () => {
    if (scrollRef.current) {
      const max = scrollRef.current.scrollHeight - scrollRef.current.clientHeight
      if(currentGifNav != 'Categories'){
        if(max - scrollRef.current.scrollTop < 1){
          getGifs()
        }
      }
    }
  };

  async function getGifs(){
    console.log("current nav: ", currentGifNav)
    // console.log("page: ", page)
    const per_page = '20';
    const page = useGlobalStore.getState().gifPage
    // console.log("GIF PAGE:", thisPage)

    let url = `https://api.klipy.co/api/v1/${KLIPY_API_CODE}/gifs/recent/${address}?page=${page}&per_page=${per_page}`
    if(currentGifNav == "Trending"){
      url = `https://api.klipy.co/api/v1/${KLIPY_API_CODE}/gifs/trending?page=${page}&per_page=${per_page}&customer_id=${address}`
    }else if(currentGifNav == "Categories"){
      // `https://api.klipy.co/api/v1/${KLIPY_API_CODE}/gifs/categories?locale={country_code}`
      url = `https://api.klipy.co/api/v1/${KLIPY_API_CODE}/gifs/categories`
    }
    setPage(page + 1)
    
    const result = await fetch(url)
    const json = await result.json()
    console.log("JSON:", json)

    if(currentGifNav == "Trending"){
      setGifs(prev => [...prev, ...json.data.data])
    }else if(currentGifNav== "Categories"){
      setGifs(prev => [...prev, ...json.data.categories])
    }
  }

  let gifsList: any[] = []
  
  if(currentGifNav == "Trending"){
    gifsList = gifs.map((gif: any) => {return <Trending gif={gif}/>})
  }else if(currentGifNav== "Categories"){
    gifsList = gifs.map((gif: any) => {return <Category category={gif.category} url={gif.preview_url}/>})
  }

  return(
    <>
      <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto overflow-x-hidden no-scrollbar">
        <Masonry columnsCount={2}>
          {gifsList}
        </Masonry>
      </div>
    </>
  )
}

function Trending(props: {gif: any}){
  const currentTextChannel = useServerStore(server => server.currentTextChannel)
  const address = useUserStore(user => user.address)
  //gif.file?.sm.gif.url
  // console.log("trending:", props.gif)

  async function sendGif(){
    push.sendImage(props.gif.file?.sm.gif.url, currentTextChannel.chatId)
    // const uuid = uuidv4()
    // console.log("uuid:", uuid)
    console.log("id: ", props.gif.id)
    var raw = JSON.stringify({
      "customer_id": address,
      "q": ""
    });

    var myHeaders = new Headers();

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow' as RequestRedirect
    };

    const result = await fetch(`https://api.klipy.co/api/v1/${KLIPY_API_CODE}/gifs/share/${props.gif.id}`, requestOptions)
    const json = await result.json()
    console.log("send gif result json:", json)
  }

  if(props.gif.file?.sm.gif.url){
    return(
      <>
        <div className="p-1">
          <button onClick={sendGif}>
            <img className="w-[240px] h-full rounded-lg object-cover" src={props.gif.file?.sm.gif.url}/>
          </button>
        </div>
      </>
    )
  }
}

function Category(props: {category: string, url: string}){
  // console.log("category: " + props.category + " url: " + props.url)
  if(props.url){
    return(
      <>
        <div className="p-1">
          <button className="relative rounded-lg w-full h-full">
            <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl bg-deep-purple-300 rounded p-1">
              {props.category}
            </div>
            <div className="absolute inset-0 bg-black/70 rounded-lg z-[5]"></div>
            <img className="w-screen h-full object-cover rounded-lg" src={props.url}/>
          </button>
        </div>
      </>
    )
  }
}
