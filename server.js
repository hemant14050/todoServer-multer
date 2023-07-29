const express = require("express");
const app = express();
const PORT = 3000;
const fs = require("fs");

app.use(express.json());

app.get("/", (req, res)=> {
    res.sendFile(__dirname + "/views/todo.html");
});

app.get("/todo.js", (req, res)=> {
    res.sendFile(__dirname + "/views/todo.js");
});

app.get("/todo.css", (req, res)=> {
    res.sendFile(__dirname + "/views/todo.css");
});

app.post("/addTodo", (req, res)=> {
    const todo = req.body.todo;
    if(!todo) {
        res.status(400).send({
            success: false,
            message: "Please enter a todo"
        });
        return;
    }
    readAndWriteFile(todo, res);
});

app.patch("/updateTodoStatus/:id", (req, res) => {
    try {
        // console.log(req.params.id);
        const id = parseInt(req.params.id);
        console.log(id);
        // console.log(typeof id);
        fs.readFile("./data/todo.json", "utf-8", (err, data) => {
            if(err) {
                res.status(500).send({
                    success: false,
                    message: "Something wents wrong!"
                });
                return;
            }
            try {
                const allTodos = JSON.parse(data);
                // console.log("Before",allTodos);
    
                const dt = allTodos.map((todo) => {
                    // console.log(typeof todo.id);
                    if(todo.id === id) {
                        // console.log("I am here");
                        return {
                            ...todo,
                            completed: !todo.completed
                        };
                    } else {
                        return todo;
                    }
                });
                // console.log("After", dt);
                writeFile(JSON.stringify(dt));
                
                res.status(200).send({
                    success: true,
                    message: `Status of Todo ${id} updated successfully!`
                });
            } catch(err) {
                res.status(500).send({
                    success: false,
                    message: "Something wents wrong!"
                });
            }
        });
    } catch(err) {
        res.status(500).send({
            success: false,
            message: "Something wents wrong!"
        });
    }
});

app.delete("/deleteTodo/:id", (req, res) => {
    try {
        // console.log(req.params.id);
        const id = parseInt(req.params.id);
        // console.log(id);
        // console.log(typeof id);
        fs.readFile("./data/todo.json", "utf-8", (err, data) => {
            if(err) {
                res.status(500).send({
                    success: false,
                    message: "Something wents wrong!"
                });
                return;
            }
            const allTodos = JSON.parse(data);
            // console.log("Before",allTodos);
            
            const dt = allTodos.filter((todo) => todo.id !== id);
            
            // console.log("After", dt);
            writeFile(JSON.stringify(dt));
            
            res.status(200).send({
                success: true,
                message: `Status of Todo ${id} deleted successfully!`
            });
        });
    } catch(err) {
        res.status(500).send({
            success: false,
            message: "Something wents wrong!"
        });
    }
});

app.get("/getAllTodos", (req, res)=> {
    try {
        fs.readFile("./data/todo.json", "utf-8", (err, data)=> {
            if(err) {
                // console.log(err);
                res.status(500).send({
                    success: false,
                    message: "Something went wrong!"
                });
                return;
            }
            const todoList = JSON.parse(data);
            res.status(200).send({
                success: true,
                todoList,
                message: "Tasks fetched successfully!"
            });
        });
    } catch(err) {
        res.status(500).send({
            success: false,
            message: "Something went wrong!"
        });
    }
});

function readAndWriteFile(todo, res) {
    try {
        fs.readFile("./data/todo.json", "utf-8", (err, data)=> {
            if(err) {
                // console.log(err);
                res.status(500).send({
                    success: false,
                    message: "Something went wrong!"
                });
                return;
            }
            const todoList = JSON.parse(data);
            todoList.push(todo);

            writeFile(JSON.stringify(todoList));
            
            res.status(200).send({
                success: true,
                message: "Todo added successfully!"
            });
            
        });
    } catch(err) {
        // console.log(err);
        res.status(500).send({
            success: false,
            message: "Something went wrong!"
        });
    }
}

function writeFile(data) {
    fs.writeFile("./data/todo.json", data, (err)=> {
        if(err) {
           return err;
        }
        // console.log("File written successfully");
    });
}

app.listen(PORT, ()=> {
    console.log(`Todo app started at PORT: ${PORT}`);
});