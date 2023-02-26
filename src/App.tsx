import { Redirect, Route } from "react-router-dom"
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import { calendar, camera, ellipse, map, square, triangle } from "ionicons/icons"
import Tab1 from "./pages/Tab1"
import Tab2 from "./pages/Tab2"
import Tab3 from "./pages/Tab3"

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css"

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css"
import "@ionic/react/css/structure.css"
import "@ionic/react/css/typography.css"

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css"
import "@ionic/react/css/float-elements.css"
import "@ionic/react/css/text-alignment.css"
import "@ionic/react/css/text-transformation.css"
import "@ionic/react/css/flex-utils.css"
import "@ionic/react/css/display.css"

/* Theme variables */
import "./theme/variables.css"

setupIonicReact()

const checkAuth = () => {
  console.log("check if disabled")
}

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/events">
            <Tab1 />
          </Route>
          <Route exact path="/map">
            <Tab2 />
          </Route>
          <Route path="/ar">
            <Tab3 />
          </Route>
          <Route exact path="/">
            <Redirect to="/events" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="events" href="/events">
            <IonIcon icon={calendar} />
            <IonLabel>Events</IonLabel>
          </IonTabButton>
          <IonTabButton tab="map" href="/map" onClick={checkAuth}>
            <IonIcon icon={map} />
            <IonLabel>Map</IonLabel>
          </IonTabButton>
          <IonTabButton tab="ar" href="/ar" onClick={checkAuth}>
            <IonIcon icon={camera} />
            <IonLabel>AR</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
)

export default App
