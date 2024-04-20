$(document).ready(function () {
  // Form submission to add a new note
  $('#noteForm').submit(function (event) {
    event.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById('fileInput');
    const noteText = $('#noteText').val().trim();
    
    formData.append('noteFile', fileInput.files[0]);
    formData.append('noteText', noteText);

    if (noteText !== '' || fileInput.files.length > 0) {
      addNote(formData);
      $('#noteText').val('');
      $('#fileInput').val('');
    }
  });

  // Function to add a new note
  function addNote(formData) {
    axios.post('/api/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => fetchNotes())
    .catch(error => console.error(error));
  }

  // Function to fetch and display all notes
  function fetchNotes() {
    axios.get('/api/notes')
      .then(response => {
        const notes = response.data;
        $('#noteList').empty();
        notes.forEach(note => {
          const listItem = `<li class="list-group-item"><b>${note.text}</b><br>PDF: ${note.fileName} <a href="/pdf/${note._id}" target="_blank">View PDF</a></li><hr>`;


          $('#noteList').append(listItem);
        });
      })
      .catch(error => console.error(error));
  }

  // Form submission to search for a note by PDF file name
  $('#searchForm').submit(function (event) {
    event.preventDefault();
    const searchQuery = $('#fileNameInput').val().trim();
    if (searchQuery !== '') {
      searchNotesBySubstring(searchQuery);
      $('#fileNameInput').val('');
    }
  });
  

  // Function to search for a note by PDF file name
 // Function to search for notes by substring in noteText
function searchNotesBySubstring(substring) {
  console.log('Searching for:', substring);
  axios.get(`/api/notes/search/${substring}`)
    .then(response => {
      console.log('Response:', response.data);
      const notes = response.data;
      $('#noteList').empty();
      if (notes.length === 0) {
        $('#noteList').append('<li class="list-group-item">No matching notes found</li>');
        return;
      }
      notes.forEach(note => {
        const listItem = `<li class="list-group-item"><b>${note.text}</b><br>PDF: ${note.fileName} <a href="/pdf/${note._id}" target="_blank">View PDF</a></li><hr>`;
        $('#noteList').append(listItem);
      });
    })
    .catch(error => {
      console.error(error);
      $('#noteList').empty().append('<li class="list-group-item">Error searching for notes</li>');
    });
}


  // Initial fetch of notes when the page loads
  fetchNotes();
});