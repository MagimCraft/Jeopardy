import { useState } from 'react'

interface Room {
  code: number
  maxKategorien: number
  maxFragen: number
  maxSpieler: number
  quizArt: string
  sortPunkte: boolean
  sortRichtung: string
  spieler: Spieler[]
  kategorien: Kategorie[]
}

interface Spieler {
  name: string
  id: number
  punkte: number
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
  const [kategorien, setKategorien] = useState<number>()
  const [fragen, setFragen] = useState<number>()
  const [spieler, setSpieler] = useState<number>()
  const [adminEdit, setAdminEdit] = useState<number>()

  //Variablen für die Anzeige
  const [anzeige, setAnzeige] = useState("login")
  const [anzeige2, setAnzeige2] = useState("board")
  const [selectedFrage, setSelectedFrage] = useState<number>()
  const [selectedKategorie, setSelectedKategorie] = useState<number>()

  // Variablen für die Räume
  const [roomID, setRoomID] = useState("")

  //Variablen für den aktuellen Raum
  const [room, setRoom] = useState<Room>()
  const [editRoom, setEditRoom] = useState<Room>()

  function reloadEditRoom(oldRoom: Room | undefined, newRoom: Room) {
    if (!oldRoom) return newRoom

    return {
      ...newRoom,
      spieler: newRoom.spieler.map(newSpi => {
        const oldSpi = oldRoom.spieler.find(oldSpi => oldSpi.id === newSpi.id)
        if (!oldSpi) return newSpi

        return {
          ...newSpi,
          name: oldSpi.name ?? newSpi.name,
          punkte: oldSpi.punkte ?? newSpi.punkte
        }
      }),

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
                  setPw("")
                }
              })
          }}>
            Login
          </button>
          <br /><br /><br />
          <button onClick={() => setAnzeige("login")}>Zurück</button>
        </>}
      </>

      {/* Admin Control */}
      <>
        {anzeige !== "admin" ? "" : <>
          <h1>Admin Panel</h1>
          <button onClick={() => setAnzeige("login")}>Abmelden</button>
          <br /><br /><br />
          <button onClick={() => {
            fetch(`${backend}/rooms`, {
              method: 'GET',
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
                  console.log("Es wurden neue Daten runtergeladen!")
                  setRooms(data)
                }
              })
          }}>Räume Aktualisieren</button>
          <br /><br /><br />
          <table>
            <thead>
              <tr>
                <th>Raum</th>
                <th>Bearbeiten</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((item) => (
                <tr key={item.code}>
                  <td>{item.code}</td>
                  <td><button onClick={() => {
                    setAnzeige("adminEdit")
                    setAdminEdit(item.code)
                    setFragen(item.maxFragen)
                    setKategorien(item.maxKategorien)
                    setSpieler(item.maxSpieler)
                  }}>Bearbeiten</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>}
      </>

      {/* Admin Room Edit */}
      <>
        {anzeige !== "adminEdit" ? "" : <>
          <h1>Bearbeite den Raum {adminEdit}</h1>
          <button onClick={() => setAnzeige("admin")}>Zurück</button>
          <button onClick={() => {
            fetch(`${backend}/rooms`, {
              method: 'GET',
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
                  console.log("Es wurden neue Daten runtergeladen!")
                  setRooms(data)
                }
              })
          }}>Raum aktualisieren</button>
          <br /><br /><br />
          Kategorien-Menge:&nbsp;
          <input type="number" placeholder="Fragen-Menge" value={kategorien} onChange={(e) => setKategorien(Number(e.target.value))} />
          <br />
          Fragen-Menge:&nbsp;
          <input type="number" placeholder="Fragen-Menge" value={fragen} onChange={(e) => setFragen(Number(e.target.value))} />
          <br />
          Spieler-Menge:&nbsp;
          <input type="number" placeholder="Spieler-Menge" value={spieler} onChange={(e) => setSpieler(Number(e.target.value))} />
          <br />
          <button onClick={() => {
            fetch(`${backend}/admin/update/menge/${adminEdit}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ kategorien: kategorien, fragen: fragen, spieler: spieler })
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
                }
              })
          }}>
            Save
          </button>
          <br /><br /><br />
          <h1>Spielbrett</h1>
          <table>
            <tbody>
              <tr>
                {rooms.find(item => item.code === adminEdit)?.kategorien.map((item, index) => (
                  <td key={index}>
                    <table>
                      <thead>
                        <tr>
                          <th>
                            {item.name.trim() === "" ? '\u00A0' : item.name}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.fragen.map((singleItem, i) => (
                          <tr key={i}>
                            <td>
                              Punkte: {singleItem.punkte}
                              <br />
                              Frage: {singleItem.frage}
                              <br />
                              Antwort: {singleItem.antwort}
                              <br />
                              <br />
                              <br />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <br /><br /><br />
          <h1>Spieler</h1>
          <table>
            <tbody>
              <tr>
                {rooms.find(item => item.code === adminEdit)?.spieler.map((item, index) => (
                  <td key={index}>
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            Spielername:&nbsp;{item.name}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Punkte:&nbsp;{item.punkte}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
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
          <button onClick={() => {
            setAnzeige("spieler")
            setEditRoom(room)

          }}>Spieler bearbeiten</button>
          <button onClick={() => {
            fetch(`${backend}/rooms/restart/${room?.code}`, {
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
          }}>Restart Game</button>

          {anzeige2 !== "board" ? "" : //Board
            <>
              <table>
                <tbody>
                  <tr>
                    {room?.kategorien.map((item, index) => (
                      <td key={index}>
                        <table>
                          <thead>
                            <tr>
                              <th>
                                {item.name.trim() === "" ? '\u00A0' : item.name}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(room.sortPunkte ? [...item.fragen].sort((a, b) => {
                              if (room.sortRichtung === "aufsteigend") {
                                return a.punkte >= b.punkte ? 1 : -1
                              } else return a.punkte >= b.punkte ? -1 : 1
                            }) : item.fragen).map((singleItem, i) => (
                              <tr key={i}>
                                <td>
                                  <button onClick={() => {
                                    setSelectedFrage(singleItem.id)
                                    setSelectedKategorie(item.id)
                                    if (room.quizArt === "f-a") {
                                      setAnzeige2("frage")
                                    }
                                    if (room.quizArt === "a-f") {
                                      setAnzeige2("antwort")
                                    }
                                  }}>
                                    {singleItem.status ? <s>{singleItem.punkte}</s> : singleItem.punkte}
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
          }

          {anzeige2 !== "frage" ? "" : //Frage
            <>
              <h1>{room?.kategorien.find(item => item.id === selectedKategorie)?.fragen.find(item => item.id === selectedFrage)?.frage}</h1>
              <button onClick={() => {
                if (room?.quizArt === "f-a") {
                  setAnzeige2("antwort")
                }
                if (room?.quizArt === "a-f") {
                  fetch(`${backend}/update/status/${room?.code}/${selectedKategorie}/${selectedFrage}`, {
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
                        setAnzeige2("board")
                      }
                    })
                }
              }}>{room?.quizArt === "f-a" ? "Antwort anzeigen" : "Zurück zum Board"}</button>
            </>
          }

          {anzeige2 !== "antwort" ? "" : //Antwort
            <>
              <h1>{room?.kategorien.find(item => item.id === selectedKategorie)?.fragen.find(item => item.id === selectedFrage)?.antwort}</h1>
              <button onClick={() => {
                if (room?.quizArt === "f-a") {
                  fetch(`${backend}/update/status/${room?.code}/${selectedKategorie}/${selectedFrage}`, {
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
                        setAnzeige2("board")
                      }
                    })
                }
                if (room?.quizArt === "a-f") {
                  setAnzeige2("frage")
                }
              }}>{room?.quizArt === "f-a" ? "Zurück zum Board" : "Frage anzeigen"}</button>
            </>
          }


          <> {/* Spieler */}
            <table>
              <tbody>
                <tr>
                  {room?.spieler.map((item, index) => (
                    <td key={index}>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              {item.name}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Punkte:&nbsp;{item.punkte}
                            </td>
                          </tr>
                          {(room.quizArt === "f-a" && anzeige2 === "antwort") || (room.quizArt === "a-f" && anzeige2 === "frage") ? <>
                            <button onClick={() => {
                              fetch(`${backend}/punkte/add/${room?.code}/${selectedKategorie}/${selectedFrage}/${item.id}`, {
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
                            }}>+</button>
                            <button onClick={() => {
                              fetch(`${backend}/punkte/remove/${room?.code}/${selectedKategorie}/${selectedFrage}/${item.id}`, {
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
                            }}>-</button>
                          </> : ""}
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
          <button onClick={() => {
            fetch(`${backend}/rooms/${room?.code}`, {
              method: 'GET',
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
          }}>Neu laden</button>
          <br /><br /><br />



          <h1>Einstellungen</h1>

          {/* Change Quiz Art */}
          Du möchtest lieber das Orignale Jeopardy spielen?&nbsp;
          <button onClick={() => {
            fetch(`${backend}/update/quizArt/${room?.code}`, {
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
          }}>{room?.quizArt === "f-a" ? "ㅤ" : "X"}</button>
          <br />
          (<b>Aktuelle Version:</b> {room?.quizArt === "f-a" ? "Normales Quiz Prinzip - Zuerst die Frage, dann die Antwort" : "Jeopardy Prinzip - Zuerst die Antwort, dann die Frage"})

          <br /><br /><br />

          Fragen auf dem Board nach Punkten sortieren?&nbsp;
          <button onClick={() => {
            fetch(`${backend}/update/sortPunkte/${room?.code}`, {
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
          }}>{!room?.sortPunkte ? "ㅤ" : "X"}</button>
          {!room?.sortPunkte ? "" : <button onClick={() => {
            fetch(`${backend}/update/sortRichtung/${room?.code}`, {
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
          }}>{room?.sortRichtung === "aufsteigend" ? "↑" : "↓"}</button>}
          &nbsp;{!room?.sortPunkte ? "" : room.sortRichtung === "aufsteigend" ? "(Aufsteigend)" : "(Absteigend)"}

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

      {/* Spieler bearbeiten */}
      <>
        {anzeige !== "spieler" ? "" : <>
          <h1>Raum-Code: {room?.code ? room.code : "Es ist ein Fehler aufgetreten! Bitte kontaktiere den Entwickler!"}</h1>
          <button onClick={() => {
            fetch(`${backend}/rooms/${room?.code}`, {
              method: 'GET',
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
          }}>Neu laden</button>
          <br /><br /><br />

          <h1>Spieler</h1>

          <button onClick={() => { //Spieler hinzufügen
            fetch(`${backend}/create/spieler/${room?.code}`, {
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
          }}>Neuen Spieler erstellen (Verbleibend: {(room?.maxSpieler || 0) - (room?.spieler.length || 0)})</button>
          <br /><br />
          {room?.spieler.map(item => ( //Bearbeiten des Spielers
            <div key={item.id}>
              Spieler {item.id}: <input type="text" placeholder={"Spieler " + item.id} value={editRoom?.spieler.find(id => id.id === item.id)?.name} onChange={(e) => { //Spielername
                setEditRoom(prevRoom => prevRoom ? { ...prevRoom, spieler: prevRoom.spieler.map(id => id.id === item.id ? { ...id, name: e.target.value } : id) } : prevRoom)
              }} />
              <input type="text" placeholder="Punkte" value={editRoom?.spieler.find(id => id.id === item.id)?.punkte} onChange={(e) => { //Spielername
                setEditRoom(prevRoom => prevRoom ? { ...prevRoom, spieler: prevRoom.spieler.map(id => id.id === item.id ? { ...id, punkte: Number(e.target.value) } : id) } : prevRoom)
              }} />
              <button onClick={() => { //Löschen des Spielers
                fetch(`${backend}/delete/spieler/${room?.code}/${item.id}`, {
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
          {room?.spieler.length || -1 > 0 ?
            <button onClick={() => { //Speichern der Spieler
              fetch(`${backend}/update/spieler/${room?.code}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editRoom?.spieler)
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
          <button onClick={() => setAnzeige("room")}>Zurück zum Board</button>
        </>}
      </>
    </div>
  );
}