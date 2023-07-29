const todoTextNode = document.getElementById("todoText");
const tasksListNode = document.getElementById("tasksList");
var checkboxes;
var deleteTodoBtns;

fetchAndRenderTasks();

function renderTasks(tasks) {
    tasksListNode.innerHTML = "";
    tasks.forEach((task) => {
        const liNode = document.createElement("li");
        liNode.className = "todoso";
        liNode.innerHTML = `
                        <div class="liText">
                            <p class="${task.completed? "todo-checked":""}" id="todo-text${task.id}">${task.todoText}</p>
                            <div class="actionsTodo">
                                <input type="checkbox" name="${task.todoText}" id="${task.id}" ${task.completed? "checked":""}>
                                <button type="button" id="deleteBtn-${task.id}">✕</button>
                            </div>
                        </div>
                        <hr/>
                        `;
        tasksListNode.appendChild(liNode);
    });
};

function fetchAndRenderTasks() {
    fetch("/getAllTodos")
    .then((res) => res.json())
    .then((data) => {
        if(data.success) {
            // console.log(data);
            renderTasks(data.todoList);

            checkboxes = document.querySelectorAll("input[type='checkbox']");
            deleteTodoBtns = document.querySelectorAll("button[type='button']");

            // console.log(deleteTodoBtns);
            addEvents();
            addEventsForDelete();
            // console.log(checkboxes);
        } else {
            alert(data.message);
        }
    })
    .catch((err) => {
        console.log(err);
        alert("Something went wrong");
    });
}

todoTextNode.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
        const todoText = todoTextNode.value;
        if(!todoText) {
            alert("Please enter a todo");
            return;
        }
        todoTextNode.value = "";
        const todo = {
            todoText,
            completed: false,
            id: Date.now()
        };
        fetch("/addTodo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({todo})
        })
        .then((res) => res.json())
        .then((data) => {
            if(data.success) {
                fetchAndRenderTasks();
            } else {
                alert(data.message);
            }
        })
        .catch((err) => {
            alert(err.message);
        })
    }
});

function addEvents() {
    checkboxes?.forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            // console.log(e);
            const currId = e.target.id;
            const currTextNode = document.getElementById(`todo-text${currId}`);
            if(e.target.checked) {
                // console.log("checked now");
                // console.log(curr);
                // console.log(typeof currId);
                updateTodoStatus(currId);
                currTextNode.classList.toggle("todo-checked");
            } else {
                // console.log("Unchecked now");
                // console.log(curr);
                updateTodoStatus(currId);
                currTextNode.classList.toggle("todo-checked");
            }
        });
    });
}

async function addEventsForDelete() {
    deleteTodoBtns?.forEach((deleteTodoBtn) => {
        // console.log(deleteTodoBtn);
        deleteTodoBtn.addEventListener("click", (e) => {
            // console.log(e);
            const currId = e.target.id.split("-")[1];
            // console.log(currId)
            deleteTodo(currId);
        });
    });
}

function updateTodoStatus(id) {
    fetch(`/updateTodoStatus/${id}`, {
        method: "PATCH"
    })
    .then((res) => res.json())
    .then((data) => {
        // console.log(data);
        if(data.success) {
            console.log("Data updated!");
        } else {
            console.log("Data not updated!");
        }
    })
    .catch((err) => {
        alert(err.message);
    })
};

function deleteTodo(id) {
    fetch(`/deleteTodo/${id}`, {
        method: "DELETE"
    })
    .then((res) => res.json())
    .then((data) => {
        // console.log(data);
        if(data.success) {
            fetchAndRenderTasks();
            // console.log("Data deteled!");
        } else {
            // console.log("Data not deleted!");
        }
    })
    .catch((err) => {
        alert(err.message);
    })
}

