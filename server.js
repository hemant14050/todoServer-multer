const express = require("express");
const app = express();
const PORT = 3000;
const fs = require("fs");
const multer  = require('multer');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static("uploads"));
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});
const upload = multer({ storage: multerStorage });

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res)=> {
    res.sendFile(__dirname + "/views/todo.html");
});

app.get("/todo.js", (req, res)=> {
    res.sendFile(__dirname + "/views/todo.js");
});

app.get("/todo.css", (req, res)=> {
    res.sendFile(__dirname + "/views/todo.css");
});

app.post("/addTodo", upload.single('todo_file'), (req, res)=> {
    const todoText = req.body.todoText;
    const file = req.file;
    const todo = {
        todoText,
        taskImg: file.originalname,
        completed: false,
        id: Date.now()
    }
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
            
            // delete image from uploads folder
            const todo = allTodos.find((todo) => todo.id === id);
            const imgPath = __dirname + "/uploads/" + todo.taskImg;
            fs.unlink(imgPath, (err) => {
                if(err) {
                    console.log(err);
                }
            });

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
            
            res.redirect("/");
            
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