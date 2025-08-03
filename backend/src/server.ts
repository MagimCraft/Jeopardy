import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
const port = 3001

//Admin Login
const password = "12345"

let normalMaxKategorien = 5
let normalMaxFragen = 5

interface Room {
  code: number
  maxKategorien: number
  maxFragen: number
  quizArt: string
  sortPunkte: boolean
  sortRichtung: string
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

const rooms: Room[] = []

app.use(cors())
app.use(express.json())

app.get("/rooms", (req, res) => {
  return res.json(rooms)
})

app.get("/rooms/:code", (req, res) => {
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  return res.json(rooms[findRoom])
})

app.get("/login/:code", (req, res) => {
  const code = Number(req.params.code)
  const findRoom = rooms.findIndex(item => item.code === code)
  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum mit diesem Code gefunden" })
  }
  return res.status(200).json(rooms[findRoom])
})

app.post("/login/admin", (req, res) => {
  const pw = req.body.pw

  if (pw !== password) {
    return res.status(400).json({ message: "Das eingegebene Passwort ist falsch!" })
  }

  return res.status(200).json(rooms)
})

app.post("/create/room", (req, res) => {
  const newCode = rooms.length > 0 ? Math.max(...rooms.map(item => item.code)) + 1 : 100000
  const newRoom = {
    code: newCode,
    maxKategorien: normalMaxKategorien,
    maxFragen: normalMaxFragen,
    quizArt: "f-a",
    sortPunkte: false,
    sortRichtung: "aufsteigend",
    kategorien: []
  }
  rooms.push(newRoom)
  return res.status(200).json(newRoom)
})

app.post("/create/kategorie/:code", (req, res) => {
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

app.post("/update/kategorien/:code", (req, res) => {
  const code = Number(req.params.code)
  console.log(req.body)
  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }


  rooms[findRoom] = { ...rooms[findRoom], kategorien: req.body }

  return res.status(200).json(rooms[findRoom])
})

app.delete("/delete/kategorie/:code/:id", (req, res) => {
  const code = Number(req.params.code)
  const id = Number(req.params.id)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom].kategorien = rooms[findRoom].kategorien.filter(item => item.id !== id).map((item, index) => ({ ...item, id: index + 1 }))

  return res.status(200).json(rooms[findRoom])
})

app.post("/create/frage/:code/:kategorie", (req, res) => {
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

app.post("/update/fragen/:code/:kategorie", (req, res) => {
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

app.delete("/delete/frage/:code/:kategorie/:id", (req, res) => {
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

app.post("/admin/update/menge/:code", (req, res) => {
  const fragen = req.body.fragen
  const kategorien = req.body.kategorien
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], maxKategorien: kategorien, maxFragen: fragen }

  console.log("Der Raum " + rooms[findRoom].code + " hat neue Mengen bekommen: " + kategorien + " Kategorien & " + fragen + " Fragen pro Kategorie")
  return res.status(200).json(rooms)
})

app.post("/update/quizArt/:code", (req, res) => {
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], quizArt: rooms[findRoom].quizArt === "f-a" ? "a-f" : "f-a" }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/sortPunkte/:code", (req, res) => {
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], sortPunkte: rooms[findRoom].sortPunkte ? false : true }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/sortRichtung/:code", (req, res) => {
  const code = Number(req.params.code)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  rooms[findRoom] = { ...rooms[findRoom], sortRichtung: rooms[findRoom].sortRichtung === "aufsteigend" ? "absteigend" : "aufsteigend" }

  return res.status(200).json(rooms[findRoom])
})

app.post("/update/status/:code/:kategorie/:frage", (req, res) => {
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

app.listen(port, () => {
  console.log(`Backend-Server wurde auf Port ${port} gestartet!`)
})