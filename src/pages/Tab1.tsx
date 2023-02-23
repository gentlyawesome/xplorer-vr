import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import ExploreContainer from "../components/ExploreContainer"
import "./Tab1.css"

// @ts-ignore
import * as fcl from "@onflow/fcl"
import { config } from "@onflow/fcl"
import { useEffect, useState } from "react"
import { logIn, wallet } from "ionicons/icons"

const Tab1: React.FC = () => {
  const [user, setUser] = useState<any>({ loggedIn: null })
  const [name, setName] = useState("") // NEW

  useEffect(() => {
    config({
      "accessNode.api": "https://rest-testnet.onflow.org", // Mainnet: "https://rest-mainnet.onflow.org"
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Mainnet: "https://fcl-discovery.onflow.org/authn"
      "0xProfile": "0xba1132bc08f82fe2",
    })
  }, [])

  useEffect(() => {
    setTimeout(() => {
      fcl.currentUser.subscribe(setUser)
    }, 800)
  }, [])

  const sendQuery = async () => {
    const profile = await fcl.query({
      cadence: `
        import Profile from 0xProfile

        pub fun main(address: Address): Profile.ReadOnly? {
          return Profile.read(address)
        }
      `,
      args: (arg: any, t: any) => [arg(user.addr, t.Address)],
    })

    setName(profile?.name ?? "No Profile")
  }

  const LoggedIn = () => {
    return (
      <div>
        <h2>Address: {user?.addr ?? "No Address"}</h2>
        <div>Profile Name: {name ?? "--"}</div> {/* NEW */}
        <IonButton onClick={sendQuery}>Send Query</IonButton>
        <IonButton onClick={fcl.unauthenticate} color="danger">
          Log Out
        </IonButton>
      </div>
    )
  }

  const LoggedOut = () => {
    return (
      <IonButtons>
        <IonButton fill="solid" onClick={fcl.logIn}>
          <IonIcon slot="start" icon={wallet}></IonIcon>
          Login
        </IonButton>
        <IonButton fill="solid" onClick={fcl.signUp}>
          <IonIcon slot="start" icon={logIn}></IonIcon>
          Signup
        </IonButton>
      </IonButtons>
    )
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h1>Events</h1>
        {user.loggedIn ? <LoggedIn /> : <LoggedOut />}
      </IonContent>
    </IonPage>
  )
}

export default Tab1
