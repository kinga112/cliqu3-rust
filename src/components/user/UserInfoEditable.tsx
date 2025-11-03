export function UserInfoEditable(props: {address: string, displayName: string, description: string, picture: string, }){
  return(
    <>
      <div className="relative w-96 h-36 rounded-xl overflow-hidden pointer-events-none z-50">
        <img className="absolute w-full h-full blur-3xl select-none" src={props.picture}/>
        <div className="absolute flex p-4 gap-4 place-items-center w-full h-full">
          <img className="w-28 h-28 rounded-lg shrink-0 object-cover select-none" src={props.picture}/>
          <div className="h-28 w-full p-2 rounded-lg bg-deep-purple-100 text-deep-purple-500 bg-opacity-50">
          {/* <div className="absolute left-36 top-4 p-1 rounded-lg bg-deep-purple-100 bg-opacity-40 text-deep-purple-500"> */}
            <div className="flex flex-col gap-1 pointer-events-auto">
              <input className="w-full text-xl font-semibold rounded border-2 border-deep-purple-500 bg-transparent placeholder:text-deep-purple-500" placeholder={`${props.displayName}`}/>
              <div className="relative">
                <button 
                  className="text-xs hover:underline" 
                  // onClick={() => {navigator.clipboard.writeText(address); setCopyText('copied')}}
                  // onMouseEnter={() => setShowCopy(true)}
                  // onMouseLeave={() => {setShowCopy(false); setCopyText('copy')}}
                >
                  {props.address.substring(0,12)}...{props.address.substring(30,42)}
                </button>
                {/* <div className={"absolute top-6 right-0 bg-deep-purple-500 text-deep-purple-500 rounded text-sm p-0.5 " + visibility}>
                  {copyText}
                </div> */}
              </div>
              <input className="w-full text-base font-light rounded border-2 border-deep-purple-500 bg-transparent placeholder:text-deep-purple-500" placeholder={`${props.description}`}/>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}