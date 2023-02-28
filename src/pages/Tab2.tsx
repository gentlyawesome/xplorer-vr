import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewDidEnter, useIonViewWillEnter } from "@ionic/react"
import { useEffect, useState } from "react"
import "./Tab2.css"
import { Geolocation } from "@capacitor/geolocation"
import * as L from "leaflet"
import { leaf } from "ionicons/icons"
import Store from "../helper/Store"

const Tab2: React.FC = () => {
  let leafletMap: any
  const zoom: number = 24
  const [events, setEvents] = useState<any>({})

  const getEventLocations = async () => {
    setEvents(await Store.get("event"))
    return events
  }

  const printCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition()

    return { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude }
  }

  const loadMap = async (lat: any, lng: any) => {
    let event = await Store.get("event")

    leafletMap = new L.Map("map")

    leafletMap.on("load", () => {
      setTimeout(() => {
        leafletMap.invalidateSize()
      }, 10)
    })

    leafletMap.setView([lat, lng], zoom)

    // let myIcon = L.icon({
    //   iconUrl: "assets/images/location-pin.png",
    //   iconSize: [40, 40],
    // })

    event.locations.forEach((location: any) => {
      let eventMarkers = new L.Marker([location.lat, location.lng])
      eventMarkers.addTo(leafletMap)
    })

    let marker = new L.Marker([lat, lng])
    marker.addTo(leafletMap)

    // Geolocation.watchPosition({ timeout: 30000 }, (data: any) => {
    //   let latlng = L.latLng(data?.coords.latitude, data?.coords.longitude)
    //   marker.setLatLng(latlng)
    // })

    // const { experience } = await fetchExperience()
    // setExp(experience)
    // if (experience && experience.markerPosition) {
    //   marker.setLatLng(experience.markerPosition)
    // }

    // leafletMap.on("click", async (data: any) => {
    //   marker.setLatLng(data.latlng)
    //   setMarkerPosition({ lat: data.latlng.lat, lng: data.latlng.lng })
    //   const resp = await fetchPlace(data.latlng.lat, data.latlng.lng)
    //   const { address } = await resp.json()
    //   if (address.city) {
    //     setPlaceName(address.city)
    //   } else {
    //     setPlaceName(address.village)
    //   }
    // })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(leafletMap)
  }

  useIonViewWillEnter(() => {
    getEventLocations()
  })

  useIonViewDidEnter(() => {
    printCurrentPosition().then(({ lat, lng }) => {
      loadMap(lat, lng)
    })
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>MAP</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div
          id="map"
          style={{
            height: "100%",
            width: "100%",
            display: "block",
            position: "absolute",
          }}
        ></div>
      </IonContent>
    </IonPage>
  )
}

export default Tab2
