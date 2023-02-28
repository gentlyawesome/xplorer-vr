import { IonContent, IonHeader, IonImg, IonPage, IonTitle, IonToolbar, useIonViewDidEnter, useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react"
import { AScene } from "aframe"
import { useEffect, useState } from "react"
import ExploreContainer from "../components/ExploreContainer"
import Store from "../helper/Store"
import "./Tab3.css"

const Tab3: React.FC = () => {
  const receiveMessage = (event: any) => {
    console.log("main", event)
  }

  useIonViewWillEnter(() => {
    window.addEventListener("message", receiveMessage, false)
  })

  useIonViewDidEnter(async () => {
    setTimeout(async () => {
      let event = await Store.get("event")
      const iframe = window.document.getElementById("iframe") as HTMLIFrameElement
      iframe.contentWindow?.postMessage({ message: "message", value: event })
    }, 5000)
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <iframe
          id="iframe"
          title="aframe"
          src="assets/ar/index.html"
          style={{ position: "absolute", width: "100%", height: "100%" }}
          allow="camera; microphone"
        ></iframe>
      </IonContent>
    </IonPage>
  )
}

export default Tab3
