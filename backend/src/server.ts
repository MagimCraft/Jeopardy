import express, {Request, Response} from 'express'
import cors from 'cors'
const app = express()
const port = 3001

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
        return res.status(400).json({message: "Es wurde kein Raum mit diesem Code gefunden"})
    }
    return res.status(200).json(rooms[findRoom])
})

app.post("/create/room", (req, res) => {
    const newCode = rooms.length > 0 ? Math.max(...rooms.map(item => item.code)) + 1 : 100000
    const newRoom = {code: newCode, quiz: []}
    rooms.push(newRoom)
    return res.status(200).json(newRoom)
})

app.listen(port, () => {
    console.log(`Backend-Server wurde auf Port ${port} gestartet!`)
})