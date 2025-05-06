import { useState, useEffect } from "react";
import { format } from 'date-fns'; 

import cloud from "./assets/weatherIcon/cloud.png";
import sun from "./assets/weatherIcon/sun.png";

import "./weather.css";
import "./index.css";


//TODO: Add input escape key; Adding pattern verity on submit to filter special characters [Done]
//TODO; Hide API keys; Created .env file [Done]

function Title({title}){
    return (<div className="normal-text">{title}</div>);
}

function GetHistory(){
    const history = [];

    function searchHistory(searchValue){

        if(searchValue !== ""){
            document.getElementById("txtCity").value = searchValue.split(',')[0];
            document.getElementById("txtCountry").value = searchValue.split(',')[1];
            
            //Fetch value
            document.getElementById("btnSetSearch").click();
        }
    }

    function deleteHistory(searchValue){
        //Remove
        if(searchValue !== ""){
            localStorage.removeItem(searchValue);

            document.getElementById("btnUpdateHistory").click();
        }
    }

    function clearHistory(){
        //Clear all
        localStorage.clear();
        document.getElementById("btnUpdateHistory").click();
    }

    if(localStorage.length >0){

        for(let i=0; i< localStorage.length; i++){
            const key = localStorage.key(i);
            const historyData = JSON.parse(localStorage.getItem(key));
            const formattedDate = format(new Date(historyData.time), "dd-MM-yyyy hh:mm:ss a");

            history.push(
                <li key={i+1} className="history-capsule sub-content-border-radius3 medium-text disp-flex-wrapper">
                  <span className="center-margin margin-indent">{historyData.city}, {historyData.country}</span>
                  <span className="align-right flex-right center-margin margin-indent">{formattedDate}</span>
                  <span className="align-right">
                    <button type="button" className="full-rounded-border history-capsule-button center-margin" onClick={(e) => searchHistory(e.target.value)} value={historyData.city+","+historyData.country}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="history-capsule-button-icon-size fill-grey no-pointer-event" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </button>
                  </span>
                  <span className="align-right">
                    <button type="button" id="btnDelete" className="full-rounded-border history-capsule-button center-margin" onClick={(e) => deleteHistory(e.target.value)} value={historyData.city}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="history-capsule-button-icon-size fill-grey no-pointer-event" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                        </svg>
                    </button>
                </span>
                </li>);
            
        }
    }else{
        history.push(<li key={0} className="history-capsule sub-content-border-radius3 medium-text disp-flex-wrapper"><span className="align-center w-100">No Record</span></li>);
    }

    return (<>
        <Title title={"Search History"} />
        <div className="w-100 align-right">
            <button type="button" className="content-border-radius trasnsparent" onClick={() => clearHistory()}>Clear</button>
        </div>
        <div className="w-100 history-list">
            <ul>
                {history}
            </ul>
        </div>
    </>);
}

async function FetchLocations({searchCity, searchCountry}){
    //API return geo code info (Mainly: lon, lat) in JSON
    let coordinateURL ="http://api.openweathermap.org/geo/1.0/direct?q="+searchCity + ","+ searchCountry+"&limit=1&appid="+ process.env.REACT_APP_OPEN_WEATHER_API_KEY;
    let locations = [];
    await fetch(coordinateURL).then(res => res.json())
    .then((result)=>{
        locations=result;
    });

    return locations;
}

async function FetchWeatherData(lon, lat) {
    //API return weather data via lon, lat in JSON

    let weatherDataURL ="https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid="+ process.env.REACT_APP_OPEN_WEATHER_API_KEY;
    
    let weatherData = [];

    await fetch(weatherDataURL).then(res => res.json())
    .then((result)=>{
        weatherData=result;
    });

    return(weatherData);
}

function ShowWeatherData(weatherData, locationData){
    if(locationData !== ""){
        return (
        <>
        <div className="disp-flex-wrapper ">
            <div>
                <Title title={"Today's Weather"} />
                <div className="large-text">
                    {Math.round(Number(weatherData.main.temp)-273)}°
                </div>
                <div className="normal-text">
                    H: {Math.round(Number(weatherData.main.temp_min)-273)}° &nbsp;L: {Math.round(Number(weatherData.main.temp_max)-273)}°
                </div>
                <div className= "light-grey bold-text">
                    {locationData}
                </div>
            </div>
            <div className="flex-right pos-relative">
                <div className="align-top-right content-image-position">
                    <img className="content-image-icon" src={Number(weatherData.weather[0].id) >= 800? sun:cloud} alt={weatherData.weather.id}></img>
                </div>                
                <div className= "normal-text light-grey content-details-bar">
                    <div className="disp-flex-details-bar">
                        <span className="flex-1 align-right">{format(new Date(), "dd-MM-yyyy hh:mm:ss a")}</span>
                        <span className="flex-1 align-right">Humidity: {weatherData.main.humidity}%</span>
                        <span className="flex-1 align-right">{weatherData.weather[0].main}</span>
                    </div>
                </div>
            </div>
            </div>
            </>);
    }else{
        return (<div className="content-main-error large-text">Not Found!</div>);
    }
}

function SearchWeather(){
    const [searchCity, setSearchCity] = useState("");
    const [searchCountry, setSearchCountry] = useState("");

    const [locationResult, setLocationResult] = useState([]);
    const [weatherData, setWeatherData] = useState([]);

    const [dispWeather, setDispWeather] = useState(null);
    const [dispHistory, setDispHistory] = useState(null);

    const [darkMode, setDarkMode] = useState(false);

    let locationName="";

    useEffect(() =>{
        setDispHistory(GetHistory());
    }, []);

    
    async function searchWeather(e){
        e.preventDefault();
        //----BYPASS----
        // addHistory();


        // //Pass to display & return
        // let weatherDataA = require("./testdata.json");

        // //setDispWeather(ShowWeatherData(weatherDataA, "Johor, MY"));
        // setDispWeather(ShowWeatherData(weatherDataA, "Johor, MY", darkMode));


        // return
        //----BYPASS----

        //Get FetchWeather from API
        //Geocode (Get available city info)
        setLocationResult(await FetchLocations({searchCity, searchCountry}));

        //ASSUMPTION: User always know city name and country, so no list out multiple result. Index = 0
        if(locationResult.length > 0 && searchCity !== "" && searchCountry !== ""){
            //get data
            setWeatherData(await FetchWeatherData(locationResult[0].lon, locationResult[0].lat));

            if(weatherData !== null){
                locationName = searchCity + ", " + searchCountry;

                //Save to local storage
                addHistory();

                //Pass to display & return
                setDispWeather(ShowWeatherData(weatherData, locationName, darkMode));
            }
        }else{
            //display no data
            setDispWeather( ShowWeatherData(null,"", darkMode));
        }
    };

    function clearSearch(e){
        setSearchCity("");
        setSearchCountry("");
    };
          
     function addHistory() {
        const city = searchCity.trim();
        const country= searchCountry.trim();
        const time = new Date();

        localStorage.setItem(city,JSON.stringify({city, country, time}));
        setDispHistory(GetHistory());
    };

    function updateHistory(){
        //Invoke click from delete button
        //Called using document.getElementByID
        setDispHistory(GetHistory());
    }

    function applySearch(){
        //Invoke click from search button
        //Called using document.getElementByID
        setSearchCity(document.getElementById("txtCity").value);
        setSearchCountry(document.getElementById("txtCountry").value);
    }

    function switchMode(){
        setDarkMode(!darkMode);

        //Switch bg
        document.body.classList.add(darkMode? "body-dark":"body-light");
        document.body.classList.remove(darkMode? "body-light":"body-dark");


       darkMode? document.body.setAttribute("disp-theme", "dark"): document.body.removeAttribute("disp-theme");
    }

    return(<>
    <div className="w-100 align-right">
        <button type="button" className="content-border-radius trasnsparent" onClick={() => switchMode()}>Mode</button>
    </div>
    <div className="main-content content-border-radius">
        <form onSubmit={async (e) => {await searchWeather(e);}}>
            <div className="disp-flex-wrapper">
            <div className="search-bar sub-content-border-radius2 flex-left">
                <div className="small-text">Country:</div>
                <input type='text' id="txtCountry" pattern="[a-zA-Z0-9]*" className="search-bar-short normal-text search-bar-text-color " onChange={(e) => setSearchCountry(e.target.value)} value={searchCountry}></input> 
                {/* <div>City:</div> */}
                <input type="text" id="txtCity" pattern="[a-zA-Z0-9]*" className="search-bar-long normal-text search-bar-text-color" onChange={(e) => setSearchCity(e.target.value)} value={searchCity}></input>
            </div>
            <div className="button-bar flex-right">
                <button type="submit" id="btnSearch" className="button-primary-color search-bar-button no-border sub-content-border-radius2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" className="search-bar-button-icon-size fill-white" viewBox="0 0 18 18">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                </button>
                <button type="button" onClick={clearSearch} className="button-primary-color search-bar-button no-border sub-content-border-radius2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="search-bar-button-icon-size fill-white" viewBox="0 0 16 16">
                       <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                </button>
            </div>
            </div>
        </form>
        <div className="div-indent-10"></div>
        <div className="content-bar content-border-radius">
            {dispWeather}
            <div className="div-indent-1"></div>
            <div className="content-bar sub-content-border-radius1">
                {dispHistory}
            </div>
        </div>

    </div>
    <div className="hidden">
        <button type="button" className="hidden" id="btnUpdateHistory" onClick={() => updateHistory()}></button>
        <button type="button" className="hidden" id="btnSetSearch" onClick={() => applySearch()}></button>
    </div>
    </>)
}

export default SearchWeather;