import { useEffect, useRef, useState } from "react";
// import { Masonry } from 'react-masonry'
// import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { useUserStore } from "../../../state-management/userStore";
import { KLIPY_API_CODE } from "../../../config";
import { useGlobalStore } from "../../../state-management/globalStore";
// import { push } from "../../../push";
import { useServerStore } from "../../../state-management/serverStore";
// import { v4 as uuidv4 } from 'uuid';

export default function Klipy() {
  return (
    <>
      <div className="flex flex-col h-full w-full">
        <Nav />
        <KlipyPage />
      </div>
    </>
  );
}

function Nav() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    console.log("input:", input);
  };

  return (
    <>
      <div className="flex flex-col p-3 gap-2 w-full bg-deep-purple-400 rounded-t-xl">
        <div className="flex justify-between gap-2">
          <NavButton nav="Recents" />
          <NavButton nav="Trending" />
          <NavButton nav="Categories" />
        </div>
        <input
          ref={inputRef}
          onChange={handleInputChange}
          className="w-full h-12 p-2 rounded bg-deep-purple-300 text-xl"
          placeholder="Search"
        />
      </div>
    </>
  );
}

function NavButton(props: {
  nav: "Recents" | "Trending" | "Categories" | "Search";
}) {
  const currentGifNav = useGlobalStore((globals) => globals.currentGifNav);
  const setCurrentGifNav = useGlobalStore(
    (globals) => globals.setCurrentGifNav,
  );

  let activeStyle = "";
  if (props.nav == currentGifNav) {
    activeStyle = "bg-deep-purple-300";
  }

  const buttonStyle =
    "w-full h-12 hover:bg-deep-purple-300 rounded text-lg " + activeStyle;

  return (
    <>
      <button
        onClick={() => setCurrentGifNav(props.nav)}
        className={buttonStyle}
      >
        {props.nav}
      </button>
    </>
  );
}

function KlipyPage() {
  const currentGifNav = useGlobalStore((globals) => globals.currentGifNav);
  const address = useUserStore((user) => user.address);
  const [klipyUrls, setKlipyUrls] = useState([""]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const setPage = useGlobalStore((globals) => globals.setKlipyPage);
  const klipy = useGlobalStore((globals) => globals.klipy);

  useEffect(() => {
    setKlipyUrls([""]);
    setPage(1);
    get();
  }, [currentGifNav, klipy]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const max =
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      if (currentGifNav != "Categories") {
        if (max - scrollRef.current.scrollTop < 1) {
          get();
        }
      }
    }
  };

  async function get() {
    // console.log("page: ", page)
    const per_page = "20";
    const page = useGlobalStore.getState().klipyPage;
    // console.log("GIF PAGE:", thisPage)

    let url = `https://api.klipy.com/api/v1/${KLIPY_API_CODE}/${klipy}/recent/${address}?page=${page}&per_page=${per_page}`;
    if (currentGifNav == "Trending") {
      url = `https://api.klipy.com/api/v1/${KLIPY_API_CODE}/${klipy}/trending?page=${page}&per_page=${per_page}&customer_id=${address}`;
    } else if (currentGifNav == "Categories") {
      // `https://api.klipy.com/api/v1/${KLIPY_API_CODE}/gifs/categories?locale={country_code}`
      url = `https://api.klipy.com/api/v1/${KLIPY_API_CODE}/${klipy}/categories`;
    }
    setPage(page + 1);

    const result = await fetch(url);
    const json = await result.json();
    // console.log("JSON:", json)

    if (currentGifNav == "Trending") {
      setKlipyUrls((prev) => [...prev, ...json.data.data]);
    } else if (currentGifNav == "Categories") {
      setKlipyUrls((prev) => [...prev, ...json.data.categories]);
    }
  }

  let klipyList: any[] = [];

  if (currentGifNav == "Trending") {
    klipyList = klipyUrls.map((gif: any) => {
      return <Trending gif={gif} />;
    });
  } else if (currentGifNav == "Categories") {
    klipyList = klipyUrls.map((gif: any) => {
      return <Category category={gif.category} url={gif.preview_url} />;
    });
  }

  // let columnsCount = 2
  // if(klipy == 'stickers'){
  // columnsCount = 3
  // }

  return (
    <>
      {/* <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto overflow-x-hidden no-scrollbar p-1.5">
        <Masonry columnsCount={columnsCount}>
          {klipyList}
        </Masonry>
      </div> */}
      {/* Using with just columns-2 causes reorder on loading more GIFs, which isnt a good interaction */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden no-scrollbar p-1.5 columns-2"
      >
        {klipyList}
      </div>
    </>
  );
}

function Trending(props: { gif: any }) {
  const currentTextChannel = useServerStore(
    (server) => server.currentTextChannel,
  );
  const address = useUserStore((user) => user.address);
  //gif.file?.sm.gif.url
  // console.log("trending:", props.gif)

  async function sendGif() {
    // push.sendImage(props.gif.file?.sm.gif.url, currentTextChannel.id)
    // const uuid = uuidv4()
    // console.log("uuid:", uuid)
    console.log("id: ", props.gif.id);
    var raw = JSON.stringify({
      customer_id: address,
      q: "",
    });

    var myHeaders = new Headers();

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect,
    };

    const result = await fetch(
      `https://api.klipy.com/api/v1/${KLIPY_API_CODE}/gifs/share/${props.gif.id}`,
      requestOptions,
    );
    const json = await result.json();
    console.log("send gif result json:", json);
  }

  if (props.gif.file?.sm.gif.url) {
    return (
      <>
        <div className="p-1.5">
          <button onClick={sendGif}>
            <img
              className="w-[240px] h-full rounded-lg object-cover"
              src={props.gif.file?.sm.gif.url}
            />
          </button>
        </div>
      </>
    );
  }
}

function Category(props: { category: string; url: string }) {
  // console.log("category: " + props.category + " url: " + props.url)
  if (props.url) {
    return (
      <>
        <div className="p-1.5">
          <button className="relative rounded-lg w-full h-full">
            <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl bg-deep-purple-300 rounded p-1">
              {props.category}
            </div>
            <div className="absolute inset-0 bg-black/70 rounded-lg z-[5]"></div>
            <img
              className="w-screen h-full object-cover rounded-lg"
              src={props.url}
            />
          </button>
        </div>
      </>
    );
  }
}
