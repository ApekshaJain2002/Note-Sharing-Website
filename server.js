const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId; // Import ObjectId
const path = require('path');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = "mongodb://127.0.0.1:27017/note-sharing";

const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) return console.error(err);
  console.log('Connected to MongoDB');

  const db = client.db('note-sharing');
  const notesCollection = db.collection('notes');

  // Handle file upload and note text
  app.post('/api/notes', upload.single('noteFile'), (req, res) => {
    const noteText = req.body.noteText;
    const file = req.file;

    const newNote = {
      text: noteText,
      fileName: file ? file.originalname : null,
      filePath: file ? file.path : null
    };

    notesCollection.insertOne(newNote, (err, result) => {
      if (err) return console.error(err);
      res.redirect('/');
    });
  });

  // Retrieve all notes
  app.get('/api/notes', (req, res) => {
    notesCollection.find({}).toArray((err, result) => {
      if (err) return console.error(err);
      res.json(result);
    });
  });

  // Serve PDF files
  app.get('/pdf/:id', (req, res) => {
    const noteId = req.params.id;

    notesCollection.findOne({ _id: ObjectId(noteId) }, (err, note) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error finding note');
        return;
      }
      if (!note || !note.filePath) {
        res.status(404).send('PDF not found');
        return;
      }

      const filePath = path.join(__dirname, note.filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error reading PDF file');
          return;
        }
        res.contentType('application/pdf');
        res.send(data);
      });
    });
  });

  // Search notes by substring in noteText
  app.get('/api/notes/search/:substring', (req, res) => {
    const substring = req.params.substring;

    notesCollection.find({ text: { $regex: substring, $options: 'i' } }).toArray((err, notes) => {
      if (err) return console.error(err);
      if (!notes || notes.length === 0) {
        res.status(404).send('No notes found');
        return;
      }
      res.json(notes);
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
