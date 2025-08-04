import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
const port = 3001

//Admin Login
const password = "12345"

let normalMaxKategorien = 5
let normalMaxFragen = 5
let normalMaxSpieler = 4

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

const rooms: Room[] = []

app.use(cors())
app.use(express.json())

//Allgemeines der Räume

app.get("/rooms", (req, res) => { //Zeige alle Räume an
  return res.json(rooms)
})

app.get("/rooms/:code", (req, res) => { //Zeige einen speziellen Raum an
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  return res.json(rooms[findRoom])
})


//Start-Screen

app.get("/login/:code", (req, res) => { //Trete einem Raum bei
  const code = Number(req.params.code)
  const findRoom = rooms.findIndex(item => item.code === code)
  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum mit diesem Code gefunden" })
  }
  return res.status(200).json(rooms[findRoom])
})

app.post("/login/admin", (req, res) => { //Melde dich als Admin an
  const pw = req.body.pw

  if (pw !== password) {
    return res.status(400).json({ message: "Das eingegebene Passwort ist falsch!" })
  }

  return res.status(200).json(rooms)
})

app.post("/create/room", (req, res) => { //Erstelle einen Raum
  const newCode = rooms.length > 0 ? Math.max(...rooms.map(item => item.code)) + 1 : 100000
  const newRoom = {
    code: newCode,
    maxKategorien: normalMaxKategorien,
    maxFragen: normalMaxFragen,
    maxSpieler: normalMaxSpieler,
    quizArt: "f-a",
    sortPunkte: false,
    sortRichtung: "aufsteigend",
    spieler: [],
    kategorien: []
  }
  rooms.push(newRoom)
  return res.status(200).json(newRoom)
})

//Board-Bearbeitung

app.post("/create/kategorie/:code", (req, res) => { //Erstelle eine Kategorie
  const code = Number(req.params.code)
  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  if (rooms[findRoom].kategorien.length === rooms[findRoom].maxKategorien) {
    return res.status(400).json({ message: "Die maximale Anzahl an Kategorien wurde erreicht!" })
  }

  const newId = rooms[findRoom].kategorien.length > 0 ? rooms[findRoom].kategorien.length + 1 : 1

  if (rooms[findRoom].kategorien.length < rooms[findRoom].maxKategorien) {
    rooms[findRoom].kategorien.push({ id: newId, name: "", fragen: [] })
  }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/kategorien/:code", (req, res) => { //Update eine Kategorie
  const code = Number(req.params.code)
  console.log(req.body)
  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }


  rooms[findRoom] = { ...rooms[findRoom], kategorien: req.body }

  return res.status(200).json(rooms[findRoom])
})

app.delete("/delete/kategorie/:code/:id", (req, res) => { //Lösche eine Kategorie
  const code = Number(req.params.code)
  const id = Number(req.params.id)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom].kategorien = rooms[findRoom].kategorien.filter(item => item.id !== id).map((item, index) => ({ ...item, id: index + 1 }))

  return res.status(200).json(rooms[findRoom])
})

app.post("/create/frage/:code/:kategorie", (req, res) => { //Erstelle eine Frage
  const code = Number(req.params.code)
  const kategorie = Number(req.params.kategorie)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === kategorie)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  if (rooms[findRoom].kategorien[findKategorie].fragen.length === rooms[findRoom].maxFragen) {
    return res.status(400).json({ message: "Die maximale Anzahl an Fragen für diese Kategorie wurde erreicht!" })
  }

  const newId = rooms[findRoom].kategorien[findKategorie].fragen.length > 0 ? rooms[findRoom].kategorien[findKategorie].fragen.length + 1 : 1

  if (rooms[findRoom].kategorien[findKategorie].fragen.length < rooms[findRoom].maxFragen) {
    rooms[findRoom].kategorien[findKategorie].fragen.push({
      id: newId,
      frage: "",
      antwort: "",
      status: false,
      punkte: 0
    })
  }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/fragen/:code/:kategorie", (req, res) => { //Update eine Frage
  const code = Number(req.params.code)
  const kategorie = Number(req.params.kategorie)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === kategorie)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  rooms[findRoom].kategorien[findKategorie] = { ...rooms[findRoom].kategorien[findKategorie], fragen: req.body }

  return res.status(200).json(rooms[findRoom])
})

app.delete("/delete/frage/:code/:kategorie/:id", (req, res) => { //Lösche eine Frage
  const code = Number(req.params.code)
  const kategorie = Number(req.params.kategorie)
  const id = Number(req.params.id)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === kategorie)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  rooms[findRoom].kategorien[findKategorie].fragen = rooms[findRoom].kategorien[findKategorie].fragen.filter(item => item.id !== id).map((item, index) => ({ ...item, id: index + 1 }))

  return res.status(200).json(rooms[findRoom])
})

app.post("/create/spieler/:code", (req, res) => { //Erstelle einen Spieler
  const code = Number(req.params.code)
  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  if (rooms[findRoom].spieler.length === rooms[findRoom].maxSpieler) {
    return res.status(400).json({ message: "Die maximale Anzahl an Spielern wurde erreicht!" })
  }

  const newId = rooms[findRoom].spieler.length > 0 ? rooms[findRoom].spieler.length + 1 : 1

  if (rooms[findRoom].spieler.length < rooms[findRoom].maxSpieler) {
    rooms[findRoom].spieler.push({ id: newId, name: "", punkte: 0 })
  }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/spieler/:code", (req, res) => { //Update eine Kategorie
  const code = Number(req.params.code)
  console.log(req.body)
  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }


  rooms[findRoom] = { ...rooms[findRoom], spieler: req.body }

  return res.status(200).json(rooms[findRoom])
})

app.delete("/delete/spieler/:code/:id", (req, res) => { //Lösche einen Spieler
  const code = Number(req.params.code)
  const id = Number(req.params.id)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom].spieler = rooms[findRoom].spieler.filter(item => item.id !== id).map((item, index) => ({ ...item, id: index + 1 }))

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/quizArt/:code", (req, res) => { //Update Quiz-Art
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], quizArt: rooms[findRoom].quizArt === "f-a" ? "a-f" : "f-a" }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/sortPunkte/:code", (req, res) => { //Update Sortierung nach Punkten
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], sortPunkte: rooms[findRoom].sortPunkte ? false : true }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/sortRichtung/:code", (req, res) => { //Update Sortierrichtung von der Sortierung nach Punkten
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], sortRichtung: rooms[findRoom].sortRichtung === "aufsteigend" ? "absteigend" : "aufsteigend" }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/status/:code/:kategorie/:frage", (req, res) => { //Update den Status einer Frage
  const code = Number(req.params.code)
  const kategorie = Number(req.params.kategorie)
  const frage = Number(req.params.frage)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === kategorie)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  const findFrage = rooms[findRoom].kategorien[findKategorie].fragen.findIndex(item => item.id === frage)

  if (findFrage === -1) {
    return res.status(400).json({ message: "Es wurde keine Frage gefunden" })
  }

  rooms[findRoom].kategorien[findKategorie].fragen[findFrage] = { ...rooms[findRoom].kategorien[findKategorie].fragen[findFrage], status: true }

  return res.status(200).json(rooms[findRoom])
})

//Punkte geben/entfernen

app.post("/punkte/add/:code/:kategorie/:frage/:spieler", (req, res) => {
  const code = Number(req.params.code)
  const kategorie = Number(req.params.kategorie)
  const frage = Number(req.params.frage)
  const spieler = Number(req.params.spieler)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === kategorie)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  const findFrage = rooms[findRoom].kategorien[findKategorie].fragen.findIndex(item => item.id === frage)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Frage gefunden" })
  }

  const findSpieler = rooms[findRoom].spieler.findIndex(item => item.id === spieler)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde kein Spieler gefunden" })
  }

  rooms[findRoom].spieler[findSpieler] = { ...rooms[findRoom].spieler[findSpieler], punkte: rooms[findRoom].spieler[findSpieler].punkte + rooms[findRoom].kategorien[findKategorie].fragen[findFrage].punkte }

  return res.status(200).json(rooms[findRoom])
})

app.post("/punkte/remove/:code/:kategorie/:frage/:spieler", (req, res) => {
  const code = Number(req.params.code)
  const kategorie = Number(req.params.kategorie)
  const frage = Number(req.params.frage)
  const spieler = Number(req.params.spieler)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === kategorie)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  const findFrage = rooms[findRoom].kategorien[findKategorie].fragen.findIndex(item => item.id === frage)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Frage gefunden" })
  }

  const findSpieler = rooms[findRoom].spieler.findIndex(item => item.id === spieler)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde kein Spieler gefunden" })
  }

  rooms[findRoom].spieler[findSpieler] = { ...rooms[findRoom].spieler[findSpieler], punkte: rooms[findRoom].spieler[findSpieler].punkte - rooms[findRoom].kategorien[findKategorie].fragen[findFrage].punkte }

  return res.status(200).json(rooms[findRoom])
})

//Restart Game

app.post("/rooms/restart/:code", (req, res) => {
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = {...rooms[findRoom], spieler: rooms[findRoom].spieler.map(item => ({...item, punkte: 0})), kategorien: rooms[findRoom].kategorien.map(item => ({...item, fragen: item.fragen.map(id => ({...id, status: false}))}))}
  return res.status(200).json(rooms[findRoom])
})

//Admin Features

app.post("/admin/update/menge/:code", (req, res) => { //Update die Raum-Menge von einem Raum als Admin
  const fragen = req.body.fragen
  const kategorien = req.body.kategorien
  const spieler = req.body.spieler

  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], maxKategorien: kategorien, maxFragen: fragen, maxSpieler: spieler }

  console.log("Der Raum " + rooms[findRoom].code + " hat neue Mengen bekommen: " + kategorien + " Kategorien & " + fragen + " Fragen pro Kategorie sowie eine maximale Anzahl von " + spieler + " Spielern.")
  return res.status(200).json(rooms)
})

app.listen(port, () => { //Starte das Backend
  console.log(`Backend-Server wurde auf Port ${port} gestartet!`)
})