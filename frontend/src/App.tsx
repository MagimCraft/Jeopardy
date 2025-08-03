import { useState, useEffect } from 'react'

interface Room {
  code: number
  maxKategorien: number
  maxFragen: number
  kategorien: Kategorie[]
}

interface Kategorie {
  name: string
  id: number
  fragen: Frage[]
}

interface Frage {
  frage: string
  antwort: string
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
  const [editRoom, setEditRoom] = useState<Room>()

  useEffect(() => { setEditRoom(room) }, [room])

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
          <input type="number" placeholder="Raum ID" value={roomID} onChange={(e) => {
            const changeRoomID = e.target.value
            if (changeRoomID.length <= 6) {
              setRoomID(changeRoomID)
            }
          }} />
          <button onClick={() => {
            fetch(`${backend}/login/${roomID}`, {
              method: 'GET'
            })
              .then(async res => {
                const data = await res.json()
                if (!res.ok) {
                  console.log("Es ist ein Fehler aufgetreten: " + data.message)
                  alert("Es ist ein Fehler aufgetreten: " + data.message)
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
          }}>Raum beitreten</button>
          <br /><br /><br />
          Noch kein Raum vorhanden? <button onClick={() => setAnzeige("create")}>Raum erstellen</button>
        </> : ""}
      </>

      {/* Aktiver Raum */}
      <>
        {anzeige !== "room" ? "" : <>
          <h1>Raum-Code: {room?.code ? room.code : "Es ist ein Fehler aufgetreten! Bitte kontaktiere den Entwickler!"}</h1>
          <button onClick={() => {
            setAnzeige("edit")
            setEditRoom(room)
          }}>Board bearbeiten</button>
        </>}
      </>

      {/* Board bearbeiten */}
      <>
        {anzeige !== "edit" ? "" : <>
          <h1>Raum-Code: {room?.code ? room.code : "Es ist ein Fehler aufgetreten! Bitte kontaktiere den Entwickler!"}</h1>

          <br /><br /><br />

          <h1>Kategorien</h1>

          <button onClick={() => { //Kategorie hinzufügen
            fetch(`${backend}/create/kategorie/${room?.code}`, {
              method: 'POST',
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
                  setRoom(data)
                }
              })
          }}>Neue Kategorie erstellen (Verbleibend: {(room?.maxKategorien || 0) - (room?.kategorien.length || 0)})</button>
          <br /><br />
          {room?.kategorien.map(item => ( //Bearbeiten der Kategorien
            <>
              Kategorie {item.id}: <input type="text" placeholder={"Kategorie " + item.id} value={editRoom?.kategorien.find(id => id.id === item.id)?.name} onChange={(e) => { //Kategoriename
                setEditRoom(prevRoom => prevRoom ? { ...prevRoom, kategorien: prevRoom.kategorien.map(id => id.id === item.id ? { ...id, name: e.target.value } : id) } : prevRoom)
              }} />
              <button onClick={() => { //Löschen der Kategorie
                fetch(`${backend}/delete/kategorie/${room?.code}/${item.id}`, {
                  method: 'DELETE',
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
                      setRoom(data)
                    }
                  })
              }}>Löschen</button>
              <br />
            </>
          ))}

          <br />
          {room?.kategorien.length || 0 > 0 ?
            <button onClick={() => { //Speichern der Kategorien
              fetch(`${backend}/update/kategorien/${room?.code}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editRoom?.kategorien)
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
                    setRoom(data)
                  }
                })
            }}>Speichern</button> : ""}
          <br /><br /><br />

          <h1>Fragen</h1>
          {room?.kategorien.filter(item => item.name.length > 0).map((item, index) => ( //Fragen für jede Kategorie
            <>
              Fragen zur Kategorie: {item.name}
              <br />
              <button onClick={() => { //Frage hinzufügen
                fetch(`${backend}/create/frage/${room?.code}/${item.id}`, {
                  method: 'POST',
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
                      setRoom(data)
                    }
                  })
              }}>Neue Frage erstellen (Verbleibend: {(room?.maxFragen || 0) - (item.fragen.length)})</button>
              <br /><br />
              {item.fragen.map(frage => (
                <>
                  Frage {frage.id}:
                  <br />
                  <input type="text" placeholder="Frage" value={editRoom?.kategorien.find(id => id.id === item.id)?.fragen.find(id => id.id === frage.id)?.frage} onChange={(e) => {
                    setEditRoom(prevRoom => prevRoom ? {...prevRoom, kategorien: prevRoom.kategorien.map(id => id.id === item.id ? {...id, fragen: id.fragen.map(res => res.id === frage.id ? {...res, frage: e.target.value} : res)} : id)} : prevRoom)
                  }} />
                  <input type="text" placeholder="Antwort" />
                  <input type="number" placeholder="Punkte" />
                  <br /><br />
                </>
              ))}

              <br />
              <button onClick={() => {
                fetch(`${backend}/update/fragen/${room?.code}/${item.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editRoom?.kategorien.find(id => id.id === item.id)?.fragen)
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
                    setRoom(data)
                  }
                })
              }}>Speichern</button>
              <br /><br /><br />
            </>

          ))}

          <> {/* Zurück zum Board */}
            <br /><br />
            <button onClick={() => {
              setAnzeige("room")
            }}>Zurück zum Board</button>
          </>
        </>}
      </>
    </div >
  );
}