import { IonContent, IonHeader, IonImg, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { AScene } from "aframe"
import { useEffect } from "react"
import ExploreContainer from "../components/ExploreContainer"
import "./Tab3.css"

const Tab3: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <iframe title="aframe" src="assets/ar/index.html" style={{ position: "absolute", width: "100%", height: "100%" }} allow="camera; microphone"></iframe>
      </IonContent>
    </IonPage>
  )
}

export default Tab3
