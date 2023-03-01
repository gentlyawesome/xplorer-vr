import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewDidLeave,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react"
import { useState } from "react"
import "./Tab2.css"
import { Geolocation } from "@capacitor/geolocation"
import * as L from "leaflet"
import Store from "../helper/Store"

const Tab2: React.FC = () => {
  let leafletMap: any
  let watcher: any
  const zoom: number = 24
  const [events, setEvents] = useState<any>({})
  const [mapInstance, setMapInstance] = useState<any>({})

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

    let map = leafletMap.setView([lat, lng], zoom)

    setMapInstance(map)

    let priceIcon = L.icon({
      iconUrl: "assets/icon/pin-aquired.png",
      iconSize: [40, 40],
    })

    let eMarkers: any = []

    event.locations.forEach((location: any) => {
      let eventMarkers = new L.Marker([location.lat, location.lng], { icon: priceIcon })
      eMarkers.push(eventMarkers)
      eventMarkers.addTo(leafletMap)
    })

    let myIcon = L.icon({
      iconUrl: "assets/icon/pin-person.png",
      iconSize: [40, 40],
    })

    let marker = new L.Marker([lat, lng], { icon: myIcon })
    marker.addTo(leafletMap)
    eMarkers.push(marker)

    if (eMarkers.length > 0) {
      var group = new (L.featureGroup as any)(eMarkers)
      var bounds = L.latLngBounds(group.getBounds())
      leafletMap.fitBounds(bounds)
    }

    watcher = Geolocation.watchPosition({ timeout: 30000 }, (data: any) => {
      let latlng = L.latLng(data?.coords.latitude, data?.coords.longitude)
      marker.setLatLng(latlng)
    })

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

  useIonViewWillLeave(() => {
    Geolocation.clearWatch({ id: watcher})
    mapInstance.off()
    mapInstance.remove()
    setMapInstance({})
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
