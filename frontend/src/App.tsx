import { useState } from 'react'

//Import MUI-Components
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import Chip from '@mui/material/Chip';

//Import MUI-Icons
import CheckIcon from '@mui/icons-material/Check';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CachedIcon from '@mui/icons-material/Cached';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

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
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', '& > :not(style)': { m: 1 } }}>
            <Fab size="small" sx={{ backgroundColor: "red" }} onClick={() => setAnzeige("login")}>
              <ArrowBackIcon />
            </Fab>
          </Box>
          <Box sx={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Typography sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
              Admin-Login
            </Typography>
          </Box>
          <Box sx={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <TextField autoComplete="off" variant="outlined" type="password" label="Admin Passwort" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Fab sx={{ backgroundColor: "lime" }} size="small" onClick={() => {
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
              <CheckIcon />
            </Fab>
            <br /><br /><br />
          </Box>
        </>}
      </>

      {/* Admin Control */}
      <>
        {anzeige !== "admin" ? "" : <>
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', '& > :not(style)': { m: 1 } }}>
            <Fab size="small" sx={{ backgroundColor: "red" }} onClick={() => setAnzeige("login")}>
              <ExitToAppIcon />
            </Fab>
          </Box>
          <Box sx={{ minHeight: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Typography sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
              Admin-Panel
            </Typography>
          </Box>
          <Box sx={{ minHeight: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <table>
              <thead>
                <tr style={{ backgroundColor: "#dac5c5ff", textAlign: "center", padding: "8px", border: '2px solid black' }}>
                  <th style={{ textAlign: "center", padding: "8px", border: '2px solid black' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                      <h3>Räume</h3>
                      <Fab sx={{ backgroundColor: "lightgray" }} size="small" onClick={() => {
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
                      }}><CachedIcon /></Fab>
                    </Box>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((item, index) => (
                  <tr key={item.code} style={{ backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white" }}>
                    <td style={{ width: "80%", textAlign: "center", padding: "8px", border: '1px solid black' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                        <h3>{item.code}</h3>
                        <Fab size="small" onClick={() => {
                          setAnzeige("adminEdit")
                          setAdminEdit(item.code)
                          setFragen(item.maxFragen)
                          setKategorien(item.maxKategorien)
                          setSpieler(item.maxSpieler)
                        }}><EditIcon /></Fab>
                      </Box></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </>}
      </>

      {/* Admin Room Edit */}
      <>
        {anzeige !== "adminEdit" ? "" : <>
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', '& > :not(style)': { m: 1 } }}>
            <Fab size="small" sx={{ backgroundColor: "red" }} onClick={() => setAnzeige("admin")}>
              <ArrowBackIcon />
            </Fab>
            <Fab size="small" sx={{ backgroundColor: "aqua" }} onClick={() => {
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
            }}><CachedIcon /></Fab>

          </Box>
          <Box sx={{ minHeight: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Typography sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
              Bearbeite den Raum {adminEdit}
            </Typography>
          </Box>
          <Box sx={{ minHeight: '10vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
              Kategorien-Menge:&nbsp;
              <TextField size="small" type="number" placeholder="Fragen-Menge" value={kategorien} onChange={(e) => setKategorien(Number(e.target.value))} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
              Fragen-Menge:&nbsp;
              <TextField size="small" type="number" placeholder="Fragen-Menge" value={fragen} onChange={(e) => setFragen(Number(e.target.value))} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
              Spieler-Menge:&nbsp;
              <TextField size="small" type="number" placeholder="Spieler-Menge" value={spieler} onChange={(e) => setSpieler(Number(e.target.value))} />
            </Box>
          </Box>
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Fab sx={{ backgroundColor: "aqua" }} size="small" onClick={() => {
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
              <SaveIcon />
            </Fab>
          </Box>
          <Box sx={{ minHeight: '15vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <br /><br /><br />
            <h1>Spielbrett</h1>
            <table>
              <tbody>
                <tr style={{ textAlign: "center", padding: "8px", border: '2px solid black' }}>
                  {rooms.find(item => item.code === adminEdit)?.kategorien.map((item, index) => (
                    <td key={index} style={{ textAlign: "center", padding: "8px" }}>
                      <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                        <table>
                          <thead>
                            <tr>
                              <th style={{ textAlign: "center", padding: "8px", border: '1px solid black' }}>
                                {item.name.trim() === "" ? '\u00A0' : item.name}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.fragen.map((singleItem, i) => (
                              <tr key={i}>
                                <td style={{ textAlign: "center", padding: "8px", border: '1px solid black' }}>
                                  <b>Punkte:&nbsp;</b> {singleItem.punkte}
                                  <br />
                                  <b>Frage:&nbsp;</b> {singleItem.frage}
                                  <br />
                                  <b>Antwort:&nbsp;</b> {singleItem.antwort}
                                  <br />
                                  <br />
                                  <br />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <h1>Spieler</h1>
            <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
              <table>
                <tbody>
                  <tr style={{ textAlign: "center", padding: "8px", border: '2px solid black' }}>
                    {rooms.find(item => item.code === adminEdit)?.spieler.map((item, index) => (
                      <td key={index} style={{ textAlign: "center", padding: "8px" }}>
                        <table>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: "center", padding: "8px", border: '1px solid black' }}>
                                <b>Spielername:&nbsp;</b>{item.name}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ textAlign: "center", padding: "8px", border: '1px solid black' }}>
                                <b>Punkte:&nbsp;</b>{item.punkte}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Box>
          </Box>
        </>}
      </>

      {/* Raum betreten / erstellen */}
      <>
        {anzeige === "create" || anzeige === "login" ? <> {/* Admin Login Button */}
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', '& > :not(style)': { m: 1 } }}>
            <Fab size="small" sx={{ backgroundColor: "gold" }} onClick={() => setAnzeige("adminLogin")}>
              <LoginIcon />
            </Fab>
          </Box>
          <Box sx={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Typography sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
              Jeopardy Quiz-Maker
            </Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
              ~:~ Create your own Quiz ~:~
            </Typography>
          </Box>
        </> : ""}

        {anzeige === "create" ? <> {/* Raum erstellen */}
          <Box sx={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Fab variant="extended" sx={{ backgroundColor: "lime" }} onClick={() => {
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
                    setAnzeige2("board")
                  }
                })
            }}>Raum erstellen</Fab>
          </Box>
          <Box sx={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            Du hast bereits einen Raum? <Button variant="outlined" onClick={() => setAnzeige("login")}>Raum beitreten</Button>
          </Box>
        </> : anzeige === "login" ? <> {/* Raum betreten */}
          <Box sx={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <TextField autoComplete="off" variant="outlined" type="number" label="Raum ID" value={roomID} onChange={(e) => {
              const changeRoomID = e.target.value
              if (changeRoomID.length <= 6) {
                setRoomID(changeRoomID)
              }
            }} />
            <Fab sx={{ backgroundColor: "lime" }} size="small" onClick={() => {
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
                    setAnzeige2("board")
                  }
                })
            }}><CheckIcon /></Fab>
          </Box>
          <Box sx={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            Noch kein Raum vorhanden? <Button variant="outlined" onClick={() => setAnzeige("create")}>Raum erstellen</Button>
          </Box>
        </> : ""}
      </>

      {/* Aktiver Raum */}
      <>
        {anzeige !== "room" ? "" : <>
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', '& > :not(style)': { m: 1 } }}>
            <Fab size="small" sx={{ backgroundColor: "red" }} onClick={() => setAnzeige("login")}>
              <ExitToAppIcon />
            </Fab>
          </Box>
          <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
              Raum-Code: {room?.code ? room.code : "Es ist ein Fehler aufgetreten! Bitte kontaktiere den Entwickler!"}
            </Typography>
          </Box>
          <Box sx={{ minHeight: '10vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
            <Fab onClick={() => {
              setAnzeige("edit")
              setEditRoom(room)

            }}><EditIcon /></Fab>
            <Fab onClick={() => {
              setAnzeige("spieler")
              setEditRoom(room)

            }}><PersonIcon /></Fab>
            <Fab sx={{ backgroundColor: "red" }} onClick={() => {
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
            }}><RestartAltIcon /></Fab>
          </Box>

          {anzeige2 !== "board" ? "" : //Board
            <>
              <Box sx={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                {room?.kategorien.length || -1 > 0 ? <table style={{ backgroundColor: "#3936efff", textAlign: "center", padding: "15px", border: '5px solid black', borderSpacing: "50px 0px" }}>
                  <tbody>
                    <tr>
                      {room?.kategorien.map((item, index) => (
                        <td key={index}>
                          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                            <table style={{ width: "100%", textAlign: "center" }}>
                              <thead>
                                <tr>
                                  <th>
                                    <Chip style={{ backgroundColor: "#9291f0ff", padding: "15px" }} label={item.name.trim() === "" ? '\u00A0' : item.name} />
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
                                      <Fab style={{ backgroundColor: singleItem.status ? "#3936efff" : "#b0afecff" , boxShadow: singleItem.status ? "none" : "default"}} variant="extended" onClick={() => {
                                        setSelectedFrage(singleItem.id)
                                        setSelectedKategorie(item.id)
                                        if (room.quizArt === "f-a") {
                                          setAnzeige2("frage")
                                        }
                                        if (room.quizArt === "a-f") {
                                          setAnzeige2("antwort")
                                        }
                                      }}>
                                        {singleItem.status ? <s>{singleItem.punkte}</s> : <b>{singleItem.punkte}</b>}
                                      </Fab>
                                    </td>
                                  </tr>
                                ))}
                                {[...Array(room.maxFragen - item.fragen.length)].map((_, i2) => (
                                  <tr key={i2}>
                                    <td><Fab variant="extended" sx={{ backgroundColor: "#3936efff", boxShadow: "none", '&:hover': { backgroundColor: "#3936efff", boxShadow: "none" } }}>&nbsp;</Fab></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Box>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table> : ""}
              </Box>
            </>
          }

          {anzeige2 !== "frage" ? "" : //Frage
            <>
              <Box sx={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                <table style={{ border: '5px solid black', width: "50%", padding: "25px" }}>
                  <tbody>
                    <tr>
                      <td>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
                          {room?.kategorien.find(item => item.id === selectedKategorie)?.fragen.find(item => item.id === selectedFrage)?.frage}
                        </Typography>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                  <Chip onClick={() => {
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
                  }} label={room?.quizArt === "f-a" ? "Antwort anzeigen" : "Zurück zum Board"} sx={{ backgroundColor: "aqua",'&:hover':{backgroundColor:"aqua"} }} />
                </Box>
              </Box>
            </>
          }

          {anzeige2 !== "antwort" ? "" : //Antwort
            <>
              <Box sx={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                <table style={{ border: '5px solid black', width: "50%", padding: "25px" }}>
                  <tbody>
                    <tr>
                      <td>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
                          {room?.kategorien.find(item => item.id === selectedKategorie)?.fragen.find(item => item.id === selectedFrage)?.antwort}
                        </Typography>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Box sx={{ minHeight: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
                  <Chip onClick={() => {
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
                  }} label={room?.quizArt === "f-a" ? "Zurück zum Board" : "Frage anzeigen"} sx={{ backgroundColor: "aqua",'&:hover':{backgroundColor:"aqua"} }} />
                </Box>
              </Box>
            </>
          }


          <> {/* Spieler */}
            <Box sx={{ minHeight: '10vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 1 } }}>
              <table style={{ textAlign: "center", padding: "15px", borderSpacing: "50px 0px" }}>
                <tbody>
                  <tr>
                    {room?.spieler.map((item, index) => (
                      <td key={index}>
                        <table style={{ padding: "15px" }}>
                          <tbody>
                            <tr>
                              <td>
                                <Chip label={item.name} sx={{ backgroundColor: "gold", padding: "15px" }} />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <Box sx={{ minHeight: '4vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                <b>Punkte:</b>&nbsp;{item.punkte}
                                </Box>
                              </td>
                            </tr>
                            <Box sx={{ minHeight: '7vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', '& > :not(style)': { m: 0.4 } }}>
                            {(room.quizArt === "f-a" && anzeige2 === "antwort") || (room.quizArt === "a-f" && anzeige2 === "frage") ? <>
                              <Fab size="small" sx={{backgroundColor:"lime",'&:hover':{backgroundColor:"lime"}}} onClick={() => {
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
                              }} ><AddIcon /></Fab>
                              <Fab size="small" sx={{backgroundColor:"red", color:"white",'&:hover':{backgroundColor:"red", color:"white"}}} onClick={() => {
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
                              }} ><RemoveIcon /></Fab>
                            </> : ""}
                            </Box>
                          </tbody>
                        </table>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Box>
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