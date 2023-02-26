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
  const [name, setName] = useState("")
  const [transactionStatus, setTransactionStatus] = useState(null)

  useEffect(() => {
    config({
      "accessNode.api": "https://rest-testnet.onflow.org", // Mainnet: "https://rest-mainnet.onflow.org"
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Mainnet: "https://fcl-discovery.onflow.org/authn"
      "0xProfile": "0xba1132bc08f82fe2",
      "0xXplorer": "0x14ba32c4cb0532ae",
      "0xEvent": "0x14ba32c4cb0532ae",
    })
  }, [])

  useEffect(() => {
    setTimeout(() => {
      fcl.currentUser.subscribe(setUser)
    }, 800)
  }, [])

  const viewEvent = async () => {
    const evnt = await fcl.query({
      cadence: `
        import Event from 0xEvent

        pub fun main(address: Address,id: String ) : Event.ReadOnly? {
          return Event.read(address, id)
        }
      `,
      args: (arg: any, t: any) => [arg("0x14ba32c4cb0532ae", t.Address), arg("123", t.String)],
    })

    console.log(evnt)
  }

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
    console.log(profile)
    setName(profile?.name ?? "No Profile")
  }

  const initAccount = async () => {
    const transactionId = await fcl.mutate({
      cadence: `
        import Profile from 0xProfile
  
        transaction {
          prepare(account: AuthAccount) {
            // Only initialize the account if it hasn't already been initialized
            if (!Profile.check(account.address)) {
              // This creates and stores the profile in the user's account
              account.save(<- Profile.new(), to: Profile.privatePath)
  
              // This creates the public capability that lets applications read the profile's info
              account.link<&Profile.Base{Profile.Public}>(Profile.publicPath, target: Profile.privatePath)
            }
          }
        }
      `,
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    })

    const transaction = await fcl.tx(transactionId).onceSealed()
    console.log(transaction)
  }

  // const viewEvent = async () => {
  //   const transactionId = await fcl.mutate({
  //     cadence: `
  //       import Xplorer from 0xXplorer

  //       transaction() {
  //         prepare(account: AuthAccount)  {
  //           let event <- account.load<@Xplorer.Event>(from: /storage/events) ?? panic("not found")
  //         }
  //       }
  //     `,
  //     payer: fcl.authz,
  //     proposer: fcl.authz,
  //     authorizations: [fcl.authz],
  //     limit: 50,
  //   })

  //   fcl.tx(transactionId).subscribe((res: any) => console.log(res))
  // }

  const createEvent = async () => {
    const transactionId = await fcl.mutate({
      cadence: `
        import Xplorer from 0xXplorer
  
        transaction {
          prepare(acct: AuthAccount) {
            let newEvent <- Xplorer.createEvent(id: 123123123, name: "Event1")

            let eventLocations <- newEvent.getEventLocations()

            eventLocations.append(<- Xplorer.createEventLocation(id: 123123, lat: 16.2840, lng: 206.0394, price: "Test")) 
            eventLocations.append(<- Xplorer.createEventLocation(id: 123123, lat: 18.2840, lng: 210.0394, price: "Test2"))

            newEvent.setEventLocations(locations: <- eventLocations)

            acct.save(<- newEvent, to:/storage/events)
            acct.link<&Xplorer.Event>(/public/events, target: /storage/events)
          }
        }
      `,
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    })

    const transaction = await fcl.tx(transactionId).onceSealed()
    console.log(transaction)
  }

  const executeTransaction = async () => {
    const transactionId = await fcl.mutate({
      cadence: `
        import Profile from 0xProfile

        transaction(name: String) {
          prepare(account: AuthAccount) {
            account
              .borrow<&Profile.Base{Profile.Owner}>(from: Profile.privatePath)!
              .setName(name)
          }
        }
      `,
      args: (arg: any, t: any) => [arg("Flow Developer!", t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 50,
    })

    fcl.tx(transactionId).subscribe((res: any) => setTransactionStatus(res.status))
  }

  const LoggedIn = () => {
    return (
      <div>
        <h2>Address: {user?.addr ?? "No Address"}</h2>
        <div>Profile Name: {name ?? "--"}</div>
        <div>Transaction Status: {transactionStatus ?? "--"}</div>
        <IonButton onClick={sendQuery}>Send Query</IonButton>
        <IonButton onClick={initAccount}>Init Account</IonButton>
        <IonButton onClick={createEvent}>Create Event</IonButton>
        <IonButton onClick={executeTransaction}>Execute Transaction</IonButton>
        <IonButton onClick={viewEvent}>Query Events</IonButton>
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
