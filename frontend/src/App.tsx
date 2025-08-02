import { useState, useEffect } from 'react'

interface Room {
  code: number
  quiz: Kategorie[]
}

interface Kategorie {
  name: string
  id: number
  fragen: Frage[]
}

interface Frage {
  text: string
  id: number
  punkte: number
  status: boolean
}

export default function App() {
  //BACKEND URL
  const backend = "http://localhost:3001"

  //Variablen für die Anzeige
  const [anzeige, setAnzeige] = useState("login")

  // Variablen für die Räume
  const [roomID, setRoomID] = useState("")

  //Variablen für den aktuellen Raum
  const [room, setRoom] = useState<Room>()

  return (
    <div>
      {/* Raum betreten / erstellen */}
      <>
        {anzeige === "create" ? <> {/* Raum erstellen */}
          <button onClick={() => {
            fetch(`${backend}/create/room`, {
              method: 'POST'
            })
              .then(async res => {
                const data = await res.json()
                if (!res.ok) {
                  alert(data.message)
                  console.log(data.message)
                  return null
                }
                return data
              })
              .then(data => {
                if (data) {
                  setAnzeige("room")
                  setRoom(data)
                }
              })
          }}>Raum erstellen</button>
          <br /><br /><br />
          Du hast bereits einen Raum? <button onClick={() => setAnzeige("login")}>Raum beitreten</button>
        </> : anzeige === "login" ? <> {/* Raum betreten */}
        < input type="number" placeholder="Raum ID" value={roomID} onChange={(e) => {
          const changeRoomID = e.target.value
          if (changeRoomID.length <= 6) {
            setRoomID(changeRoomID)
          }
        }} />
        <br /><br /><br />
        Noch kein Raum vorhanden? <button onClick={() => setAnzeige("create")}>Raum erstellen</button>
      </> : ""}
    </>

      {/* Aktiver Raum */ }
  <>
    {anzeige !== "room" ? "" : <>
      <h1>{room?.code ? room.code : "Es ist ein Fehler aufgetreten! Bitte kontaktiere den Entwickler!"}</h1>
    </>}
  </>
    </div >
  );
}