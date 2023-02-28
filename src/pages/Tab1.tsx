import { IonButton, IonContent, IonPage, useIonRouter } from "@ionic/react"
import "./Tab1.css"

// @ts-ignore
import * as fcl from "@onflow/fcl"
import { config } from "@onflow/fcl"
import { useEffect, useState } from "react"
import Store from "../helper/Store"

const Tab1: React.FC = () => {

  const [user, setUser] = useState<any>({ loggedIn: null })
  const [name, setName] = useState("")
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [events, setEvent] = useState<any>([])
  const router = useIonRouter()

  const handleSelect = async (value: any) => {
    await Store.set("event", value)
    setEvent(value)

    router.push("/map", "forward", "push")
  }

  useEffect(() => {
    config({
      "accessNode.api": "https://rest-testnet.onflow.org", // Mainnet: "https://rest-mainnet.onflow.org"
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Mainnet: "https://fcl-discovery.onflow.org/authn"
      "0xProfile": "0xba1132bc08f82fe2",
      "0xXplorer": "0x08e5307bcd158b60",
      "0xEvents": "0x541ae074eb3b46ba",
    })
  }, [])

  useEffect(() => {
    setTimeout(() => {
      fcl.currentUser.subscribe((currentUser: any) => {
        setUser(currentUser)
        if (currentUser.addr) {
          sendQuery()
          viewEvent()
        } else {
          setEvent([])
        }
      })
    }, 800)
  }, [])

  const viewEvent = async () => {
    const evnt = await fcl.query({
      cadence: `
        import Events from 0xEvents
           
        pub fun main(address: Address) : @[Events.Event]? {
            return <- Events.read(address)
        }
      `,
      args: (arg: any, t: any) => [arg("0x541ae074eb3b46ba", t.Address)],
    })

    setEvent(evnt)
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
  }

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
      <div className="text-white">
        <h2>Address: {user?.addr ?? "No Address"}</h2>
        {/* <IonButton onClick={sendQuery}>Send Query</IonButton>
        <IonButton onClick={initAccount}>Init Account</IonButton>
        <IonButton onClick={createEvent}>Create Event</IonButton>
        <IonButton onClick={executeTransaction}>Execute Transaction</IonButton>
        <IonButton onClick={viewEvent}>Query Events</IonButton> */}
        <IonButton onClick={fcl.unauthenticate} color="danger">
          Log Out
        </IonButton>
      </div>
    )
  }

  const LoggedOut = () => {
    return (
      <>
        <div className="flex flex-row space-x-4 mb-4">
          <span className="bg-blue-400 basis-1/2 px-4 py-4 text-center text-white text-2xl rounded-xl" onClick={fcl.logIn}>
            <i className="fa-solid fa-wallet"></i> Login
          </span>
          <span className="bg-blue-400 basis-1/2 px-4 py-4 text-center text-white text-2xl rounded-xl" onClick={fcl.signUp}>
            <i className="fa-solid fa-right-to-bracket"></i> Signup
          </span>
        </div>
      </>
    )
  }

  const Events = () => {
    return (
      <div className="flex flex-col mt-10 px-4">
        {events &&
          events.length > 0 &&
          events.map((event: any) => (
            <div key={event.uuid} onClick={() => handleSelect(event)}>
              <button className="block bg-blue-400 p-2 text-white rounded-lg mt-5 w-full h-20 text-2xl">
                <i className="fa-solid fa-star"></i> {event.name}
              </button>
            </div>
          ))}
      </div>
    )
  }

  return (
    <IonPage>
      <IonContent>
        <div className="bg-blue-400 p-4">
          <h1 className="text-white text-4xl">Events</h1>
          {user.loggedIn ? <LoggedIn /> : <LoggedOut />}
        </div>
        <Events />
      </IonContent>
    </IonPage>
  )
}

export default Tab1
