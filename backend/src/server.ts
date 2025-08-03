import express, { Request, Response } from 'express'
import cors from 'cors'
const app = express()
const port = 3001

const normalMaxKategorien = 5
const normalMaxFragen = 5

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

const rooms: Room[] = []

app.use(cors())
app.use(express.json())

app.get("/rooms", (req, res) => {
  return res.json(rooms)
})

app.get("/login/:code", (req, res) => {
  const code = Number(req.params.code)
  const findRoom = rooms.findIndex(item => item.code === code)
  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum mit diesem Code gefunden" })
  }
  return res.status(200).json(rooms[findRoom])
})

app.post("/create/room", (req, res) => {
  const newCode = rooms.length > 0 ? Math.max(...rooms.map(item => item.code)) + 1 : 100000
  const newRoom = {
    code: newCode,
    maxKategorien: normalMaxKategorien,
    maxFragen: normalMaxFragen,
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

app.post("/update/kategorie/:code/:id", (req, res) => {
  const code = Number(req.params.code)
  const id = Number(req.params.id)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const findKategorie = rooms[findRoom].kategorien.findIndex(item => item.id === id)

  if (findKategorie === -1) {
    return res.status(400).json({ message: "Es wurde keine Kategorie gefunden" })
  }

  rooms[findRoom].kategorien[findKategorie] = { ...rooms[findRoom].kategorien[findKategorie], name: req.body.name }

  return res.status(200).json(rooms[findRoom])
})

app.delete("/delete/kategorie/:code/:id", (req, res) => {
  const code = Number(req.params.code)
  const id = Number(req.params.id)

  const findRoom = rooms.findIndex(item => item.code === code)

  if (findRoom === -1) {
    return res.status(400).json({ message: "Es wurde kein Raum gefunden" })
  }

  const updatedRoom = rooms[findRoom].kategorien.filter(item => item.id !== id).map((item, index) => ({ ...item, id: index + 1 }))
  rooms[findRoom].kategorien = updatedRoom

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
    rooms[findRoom].kategorien[findKategorie].fragen.push({ id: newId, frage: "", antwort: "", status: false, punkte: 0})
  }

  return res.status(200).json(rooms[findRoom])
})

app.listen(port, () => {
  console.log(`Backend-Server wurde auf Port ${port} gestartet!`)
})