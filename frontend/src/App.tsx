import { useState } from 'react'

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

  //Variablen für den Admin Login
  const [pw, setPw] = useState("")

  //Variablen für den Admin Control
  const [rooms, setRooms] = useState<Room[]>([])

  //Variablen für die Anzeige
  const [anzeige, setAnzeige] = useState("login")

  // Variablen für die Räume
  const [roomID, setRoomID] = useState("")

  //Variablen für den aktuellen Raum
  const [room, setRoom] = useState<Room>()
  const [editRoom, setEditRoom] = useState<Room>()

  function reloadEditRoom(oldRoom: Room | undefined, newRoom: Room) {
    if (!oldRoom) return newRoom

    return {
      ...newRoom,
      kategorien: newRoom.kategorien.map(newKat => {
        const oldKat = oldRoom.kategorien.find(oldKat => oldKat.id === newKat.id)
        if (!oldKat) return newKat

        return {
          ...newKat,
          name: oldKat.name ?? newKat.name,
          fragen: newKat.fragen.map(newFrage => {
            const oldFrage = oldKat.fragen.find(oldFrage => oldFrage.id === newFrage.id)
            if (!oldFrage) return newFrage;

            return {
              ...newFrage,
              frage: oldFrage.frage ?? newFrage.frage,
              antwort: oldFrage.antwort ?? newFrage.antwort,
              punkte: oldFrage.punkte ?? newFrage.punkte,
            }
          })
        }
      })
    }
  }

  return (
    <div>
      {/* Admin Login */}
      <>
        {anzeige !== "adminLogin" ? "" : <>
          <input type="text" placeholder="Admin Passwort" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button onClick={() => {
            fetch(`${backend}/login/admin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pw: pw })
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
                  setRooms(data)
                  setAnzeige("admin")
                }
              })
          }}>
            Login
          </button>
          <br /><br /><br />
          <button onClick={() => setAnzeige("login")}>Zurück</button>
        </>}
      </>

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
        {anzeige === "create" || anzeige === "login" ? <> {/* Admin Login Button */}
          <br /><br /><br /><br /><br />
          Bist du ein Admin?&nbsp;
          <button onClick={() => setAnzeige("adminLogin")}>
            Login
          </button>
        </> : ""}
      </>

      {/* Aktiver Raum */}
      <>
        {anzeige !== "room" ? "" : <>
          <h1>Raum-Code: {room?.code ? room.code : "Es ist ein Fehler aufgetreten! Bitte kontaktiere den Entwickler!"}</h1>
          <button onClick={() => setAnzeige("login")}>Zurück</button>
          <br /><br /><br />
          <button onClick={() => {
            setAnzeige("edit")
            setEditRoom(room)

          }}>Board bearbeiten</button>

          <> {/* Board */}
            <table>
              <tbody>
                <tr>
                  {room?.kategorien.map((item, index) => (
                    <td key={index}>
                      <table>
                        <thead>
                          <tr>
                            <th>
                              {item.name}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.fragen.map((singleItem, i) => (
                            <tr key={i}>
                              <td>
                                <button>
                                  {singleItem.punkte}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {[...Array(room.maxFragen - item.fragen.length)].map((_, i2) => (
                            <tr key={i2}>
                              <td><button>&nbsp;</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </>
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
                  setEditRoom(prev => reloadEditRoom(prev, data))
                }
              })
          }}>Neue Kategorie erstellen (Verbleibend: {(room?.maxKategorien || 0) - (room?.kategorien.length || 0)})</button>
          <br /><br />
          {room?.kategorien.map(item => ( //Bearbeiten der Kategorien
            <div key={item.id}>
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
                      setEditRoom(prev => reloadEditRoom(prev, data))
                    }
                  })
              }}>Löschen</button>
              <br />
            </div>
          ))}

          <br />
          {room?.kategorien.length || -1 > 0 ?
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
                    setEditRoom(prev => reloadEditRoom(prev, data))
                  }
                })
            }}>Speichern</button> : ""}
          <br /><br /><br />

          <h1>Fragen</h1>
          {room?.kategorien.filter(item => item.name.length > 0).map((item, index) => ( //Fragen für jede Kategorie
            <div key={item.id}>
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
                      setEditRoom(prev => reloadEditRoom(prev, data))
                    }
                  })
              }}>Neue Frage erstellen (Verbleibend: {(room?.maxFragen || 0) - (item.fragen.length)})</button>
              <br /><br />
              {item.fragen.map(frage => ( //Bearbeiten der Fragen
                <div key={frage.id}>
                  Frage {frage.id}:
                  <br />
                  <input type="text" placeholder="Frage" value={editRoom?.kategorien.find(id => id.id === item.id)?.fragen.find(id => id.id === frage.id)?.frage} onChange={(e) => {
                    setEditRoom(prevRoom => prevRoom ? { ...prevRoom, kategorien: prevRoom.kategorien.map(id => id.id === item.id ? { ...id, fragen: id.fragen.map(res => res.id === frage.id ? { ...res, frage: e.target.value } : res) } : id) } : prevRoom)
                  }} />
                  <input type="text" placeholder="Antwort" value={editRoom?.kategorien.find(id => id.id === item.id)?.fragen.find(id => id.id === frage.id)?.antwort} onChange={(e) => {
                    setEditRoom(prevRoom => prevRoom ? { ...prevRoom, kategorien: prevRoom.kategorien.map(id => id.id === item.id ? { ...id, fragen: id.fragen.map(res => res.id === frage.id ? { ...res, antwort: e.target.value } : res) } : id) } : prevRoom)
                  }} />
                  <input type="number" placeholder="Punkte" value={editRoom?.kategorien.find(id => id.id === item.id)?.fragen.find(id => id.id === frage.id)?.punkte} onChange={(e) => {
                    setEditRoom(prevRoom => prevRoom ? { ...prevRoom, kategorien: prevRoom.kategorien.map(id => id.id === item.id ? { ...id, fragen: id.fragen.map(res => res.id === frage.id ? { ...res, punkte: Number(e.target.value) } : res) } : id) } : prevRoom)
                  }} />
                  <button onClick={() => {
                    fetch(`${backend}/delete/frage/${room?.code}/${item.id}/${frage.id}`, {
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
                          setEditRoom(prev => reloadEditRoom(prev, data))
                        }
                      })
                  }}>Löschen</button>
                  <br /><br />
                </div>
              ))}

              <br />
              <button onClick={() => { //Speichern der Fragen
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
                      setEditRoom(prevEditRoom => reloadEditRoom(prevEditRoom, data))
                    }
                  })
              }}>Speichern</button>
              <br /><br /><br />
            </div>

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