import express, { response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(cors())
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));
app.use(express.static('build'))

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

const requestLogger = (request, response, next) => {
console.log('Method:', request.method)
console.log('Path:  ', request.path)
console.log('Body:  ', request.body)
console.log('---')
next()
}  

app.use(requestLogger)






app.get('/api/notes', (req,res) => {
    res.json(notes)
})

app.get('/api/notes/:id', (req, res)=>{
    const id = Number(req.params.id)
    console.log(id)
    const note = notes.find(note => note.id === id)

    if(note){
        res.json(note)
    }else{
        res.status(404).end()
    }  
})

app.delete('/api/notes/:id', (req, res) =>{
    const id = Number(req.params.id)
    notes = notes.filter(note => note.id !== id)

    res.status(204).end()
})

app.put('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id)
    const changedNote = req.body
    console.log('prev', notes)
    const note = notes.find(note => note.id === id)

    if(note){
        
        notes = notes.map(note => note.id !== id ? note: changedNote)
        console.log('after notes',notes)
        return res.status(200).json(changedNote);
    }else {
        return res.status(404).json({message :'update failed'})
    }
    

} )
const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }

app.post('/api/notes', (req, res) => {
    const body = req.body

    if(!body.content){
        return res.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateId(),
    }

    notes = notes.concat(note)

    res.json(note)

  })

const unknownEndpoint = (request, response) => {
response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})


