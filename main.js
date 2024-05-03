
/*
Globala variabler är deklarerade utanför någon funktion och är tillgängliga över hela skriptet. 
De kan användas överallt i koden, både innan och efter deklarationen. 
*/
const tabell = document.querySelector('#table-body');
const addTaskBtn = document.querySelector('#addTaskBtn');
const tasks = [];
// -----------------------------------------

/*
Promises (löften) är ett sätt att hantera asynkron kod i JavaScript.
 I stället för att vänta på att en operation ska slutföras innan du
  fortsätter med nästa, kan du använda löften för att fortsätta
   exekvering och sedan hantera resultatet när det blir tillgängligt.
*/

// Visa data från JSON-servern--------------------------------------------------
// 1. Skickar en HTTP GET-förfrågan till URL:en http://localhost:3000/todos
// 2. fetch() returnerar ett Promise-objekt som representerar det slutliga resultatet av förfrågan.
// 3.  response.json() extraherar JSON från svaret och returnerar ett Promise-objekt.
// 4. data.map hanterar den erhållna datan (i variabeln data) och skapar HTML för varje rad i tabellen.
fetch('http://localhost:3000/todos')
  .then(response => response.json())
  .then(data => {
    const rowsHTML = data.map(todo => {
      tasks.push(todo); // lägg objektet i en lista och returnera strängen nedan 

       // Tilldela en klass baserad på prioritet
      let priorityClass = '';
      if (todo.priority === 'Low') {
        priorityClass = 'priority-low';
      } else if (todo.priority === 'Medium') {
        priorityClass = 'priority-medium';
      } else if (todo.priority === 'High') {
        priorityClass = 'priority-high';
      }

      return ` 
        <tr id="row-${todo.id}">
          <td>${todo.task}</td>
          <td class="${priorityClass}">${todo.priority}</td>
          <td>${todo.due_date}</td>
          <td>${todo.status}</td>
          <td> <button onclick="DeleteTask('${todo.id}')"> Delete </button> </td>
          <td> <button onclick="EditTask('${todo.id}')"> Edit </button> </td>
        </tr>
      `;
    }).join('');
    console.log(tasks);
    tabell.innerHTML = rowsHTML;
  })
  .catch(error => console.error('Error fetching data:', error));

   // EventListeners---------------------------------
   addTaskBtn.addEventListener("click", AddTask);

  // Funktioner-----------------------------------

  
function EditTask(id) 
{
    const taskToEdit = tasks.find(task => task.id === id); // leta efter en task med detta id 
    if (taskToEdit!=null)
    {
      // leta efter raden med detta id 
         const row = document.querySelector(`#row-${taskToEdit.id}`);
         // imitera den tidigare strukturen med td, table data, fast skapa input-fält istället för att bara visa task
         row.innerHTML = `
            <td><input id="task-text-${taskToEdit.id}" type="text" value="${taskToEdit.task}" placeholder="Task" /></td>
            <td>
                <select id="task-priority-${taskToEdit.id}">
                    <option value="Low" ${taskToEdit.priority === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${taskToEdit.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${taskToEdit.priority === 'High' ? 'selected' : ''}>High</option>
                </select>
            </td>
            <td><input id="task-date-${taskToEdit.id}" type="date" value="${taskToEdit.due_date}" placeholder="Due Date" /></td>
            <td>
                <select id="task-status-${taskToEdit.id}">
                    <option value="Not Started" ${taskToEdit.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="In Progress" ${taskToEdit.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${taskToEdit.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td><button onclick="UpdateTask('${taskToEdit.id}')">Save</button></td>
            <td><button onclick="CancelEdit('${taskToEdit.id}')">Cancel</button></td>
        `;
    }
}

function CancelEdit(taskId)
{
  // hitta raden vars edit-läge ska avbrytas 
    const row = document.querySelector(`#row-${taskId}`);

    if (row!=null)
    {
    // om raden hittades, leta efter tasken i arrayn
       const taskToCancel = tasks.find(task => task.id === taskId);

    if (taskToCancel!=null)
    {
    // om tasken hittades, återgå till dess standard-vy 
      row.innerHTML = ` 
        <tr id="row-${taskToCancel.id}">
          <td>${taskToCancel.task}</td>
          <td>${taskToCancel.priority}</td>
          <td>${taskToCancel.due_date}</td>
          <td>${taskToCancel.status}</td>
           <td> <button onclick="DeleteTask('${taskToCancel.id}')"> Delete </button> </td>
           <td> <button onclick="EditTask('${taskToCancel.id}')"> Edit </button> </td>
        </tr>
      `;
    }
  }
}

function UpdateTask(taskId) 
{
 const updatedTask = 
 {
        task: document.querySelector(`#task-text-${taskId}`).value,
        priority: document.querySelector(`#task-priority-${taskId}`).value,
        due_date: document.querySelector(`#task-date-${taskId}`).value,
        status: document.querySelector(`#task-status-${taskId}`).value
    };

    // Skicka en PATCH-begäran till servern för att uppdatera uppgiften med det angivna taskId
    fetch(`http://localhost:3000/todos/${taskId}`, {
        method: 'PATCH', // eller 'PUT' om hela resursen ska uppdateras
        headers: {
            'Content-Type': 'application/json' // Anger att datan som skickas är i JSON-format
        },
        body: JSON.stringify(updatedTask) // Konvertera uppdaterade data till JSON-format
    })
    .then(response => {
        // Hantera svar från servern
        if (!response.ok) { // Kontrollera om svaret är lyckat
            // Kasta ett fel om svaret inte är ok och inkludera statusbeskrivningen
            throw new Error('Nätverkssvar var inte ok ' + response.statusText);
        }
        return response.json(); // Konvertera svaret till JSON-format
    })
    .then(data => {
        // Hantera den konverterade JSON-datan
        console.log('Lyckades:', data); // Logga den uppdaterade datan till konsolen
    })
    .catch(error => {
        console.error('Fel:', error); // Logga eventuella fel till konsolen
        alert('Misslyckades med att uppdatera uppgiften.'); // Visa en notifiering om att uppgiften inte kunde uppdateras
    });
}



function DeleteTask(id) 
{
    const taskToDelete = tasks.find(task => task.id === id); // leta efter en task med detta id 
    if (taskToDelete != null)
     {
        const confirmDelete = confirm(`Are you sure you want to delete this task with id: ${taskToDelete.id} `);
        if (confirmDelete)
         {
        fetch(`http://localhost:3000/todos/${id}`, 
        {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            console.log('Task deleted successfully:', taskToDelete.task);
        })
        .catch(error => {
            console.error('Error deleting task:', error);
        });
    } else 
    {
        console.error('Task not found with id:', id);
    }
}

}

  function AddTask()
   {
/*
Om variablerna taskText, taskPriority, taskDate, och taskStatus deklareras utanför AddTask()-funktionen,
 skulle de vara globala variabler och hämtas en gång när skriptet laddas.
  Deras värden skulle inte uppdateras när användaren interagerar med formuläret.
*/
    const taskText = document.querySelector('#task-text').value;
    const taskPriority = document.querySelector('#task-priority').value;
    const taskDate = document.querySelector('#task-date').value;
    const taskStatus = document.querySelector('#task-status').value;

    // Skapa en ny task utifrån användarens input. 
    const newTask = 
    {
        task: taskText,
        priority: taskPriority,
        due_date: taskDate,
        status: taskStatus
    };

      // Skicka POST-förfrågan till servern
    fetch('http://localhost:3000/todos', 
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error adding task:', error);
    });


  }
