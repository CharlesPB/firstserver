
let express = require("express");
let morgan = require("morgan");
let mongoose = require("mongoose");
let bodyParser = require('body-parser');
let { StudentList } = require('./model');

const { DATABASE_URL, PORT } = require("./config");

let app = express();
let jsonParser = bodyParser.json();

mongoose.Promise = global.Promise;

app.use(express.static('public'));

app.use(morgan("dev"));

let students = [{
        name : "Mario",
        id: 52436
    },
    {
        name : "Maria",
        id: 83746
    },
    {
        name : "Pedro",
        id: 12345
    }];

// get("/api/students/:id"
// in postman localhost:8080/api/students/12345
// req.params.id
app.get("/api/students", (req, res, next) => {
    StudentList.get()
        .then( students => {
            return res.status(200).json( students );
        })
        .catch( error => {
            res.statusMessage = "Something went wrong with the DB. Try again later";
            return res.status( 500 ).json({
                status : 500,
                message : "Something went wrong with the DB. Try again later"
            })
        });

    //res.statusMessage = "Something went wrong. Try again later.";
    //return res.status(400).json({message : "Something went wrong. Try again later.", status : 400});

});

// listo
// localhost:8080/api/getStudentById?id=123
app.get("/api/getStudentById", (req, res, next) => {
    let id = req.query.id;

    if ( ! id ){
      res.statusMessage = "Missing id in parameter!";
      return res.status(406).json({
        message : "Missing id in parameter!",
        status : 406
      });
    }

    StudentList.getbyID(id)
        .then( student =>{
            if ( student ) {
              return res.status(202).json({
                message : "Student found in the list",
                status : 202,
                student : student
              });
            }
            else {
              res.statusMessage = "Student not found on the list";
              return res.status(404).json({
                message : "Student not found on the list",
                status : 404
              });
            }

        })
        .catch( error => {
            res.statusMessage = "Something went wrong with the DB. Try again later";
            return res.status( 500 ).json({
                status : 500,
                message : "Something went wrong with the DB. Try again later"
            })
        });

});

// sí lo publica pero no valida
app.post( "/api/postStudent", jsonParser, (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let id = req.body.id;

    if ( ! firstName || ! lastName || ! id ){
      res.statusMessage = "Missing field in body!";
      return res.status(406).json({
        message : "Missing field in body!",
        status : 406
      });
    }

    let newStudent = {
        firstName,
        lastName,
        id
    }

    StudentList.post(newStudent)
        .then( student =>{
            // if an id is repeated
            for (var i = 0; i < StudentList.length; i++) {
              if (newStudent.id == StudentList[i].id) {
                res.statusMessage = "Repeated identifier";
                return res.status(409).json({
                  message : "Repeated identifier",
                  status : 409
                });
              }
            }

            return res.status(201).json({
              message : "Student added to the list",
              status : 201,
              student : newStudent
            });
        })
        .catch( error => {
            res.statusMessage = "Something went wrong with the DB. Try again later";
            return res.status( 500 ).json({
                status : 500,
                message : "Something went wrong with the DB. Try again later"
            })
        });
    /*
    if ( ! name || ! id ){
      res.statusMessage = "Missing field in body!";
      return res.status(406).json({
        message : "Missing field in body!",
        status : 406
      });
    }

    // if an id is repeated
    for (var i = 0; i < students.length; i++) {
      students[i]
      if (id == students[i].id) {
        res.statusMessage = "Repeated identifier";
        return res.status(409).json({
          message : "Repeated identifier",
          status : 409
        });
      }
    }

    // if id exists and isn't repeated, create new Student and add it to list
    let newStudent = {name: name, id: id};
    students.push(newStudent);
    return res.status(201).json(newStudent);
    */
});

// no está listo
app.delete("/api/removeStudent/:id", (req, res, next) => {
    let paramsID = req.params.id;


    StudentList.delete()
        .then( students =>{



            let doc = student.findOne({_id:paramsID});

            if ( ! doc ){
              //if id is not found
              res.statusMessage = "ID not found on the list";
              return res.status(404).json({
                message : "ID not found on the list",
                status : 404
              });
            }

            students.remove({_id: doc._id});

            return res.status(201).json({
              message : "Student succesfully removed",
              status : 201,
              student : doc
            });


        })
        .catch( error => {
            res.statusMessage = "Something went wrong with the DB. Try again later";
            return res.status( 500 ).json({
                status : 500,
                message : "Something went wrong with the DB. Try again later"
            })
        });
});

// listo
app.put("/api/updateStudent", jsonParser, (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let id = req.body.id;

    if ( !id ){
      res.statusMessage = "Missing 'id' field in body!";
      return res.status( 406 ).json({
        message : "Missing 'id' field in body!",
        status : 406
      });
    }

    if( !firstName && !lastName ){
      res.statusMessage = "You must at least send either firstName or lastName to update!";
      return res.status( 406 ).json({
        message : "You must at least send either firstName or lastName to update!",
        status : 406
      });
    }

    let updatedStudent = {id : id};

    StudentList.put(updatedStudent)
            .then( student =>{
                    res.status(200).json({
                            message : "Succesfully updated the student",
                            status : 200,
                            student : student
                    })
            })
            .catch( error => {
                    if (error.message == 404) {
                              return res.status( 404 ).json({
                                  status : 404,
                                  message : "Student not found in the list"
                              })
                    }
                    else {
                              res.statusMessage = "Something went wrong with the DB. Try again later";
                              return res.status( 500 ).json({
                                  status : 500,
                                  message : "Something went wrong with the DB. Try again later"
                              })
                    }

            });
    /*
    // to check if id exists
    for (var i = 0; i < students.length; i++) {
      students[i]
      if (id == students[i].id) {
        students[i].name = name;

        return res.status(200).json( students[i] );
      }
    }

    // if id not found
    res.statusMessage = "id not found";
    return res.status(409).json({
      message : "id not found",
      status : 409
    });
    */
});



let server;

function runServer(port, databaseUrl){
  return new Promise( (resolve, reject ) => {
      mongoose.connect(databaseUrl, response => {
        if ( response ) {
            return reject(response);
        }
        else{
            server = app.listen(port, () => {
              console.log("App is running on port " + port);
              resolve();
            })
            .on( 'error', err => {
                mongoose.disconnect();
                return reject(err);
            });
        }
      });
  });
}

function closeServer(){
  return mongoose.disconnect()
      .then(() => {
          return new Promise((resolve, reject) => {
            console.log('Closing the server');
            server.close( err => {
              if (err){
                return reject(err);
              }
              else{
                resolve();
              }
            });
          });
      });
}

runServer( PORT, DATABASE_URL )
    .catch( err => {
      console.log( err );
    } );

module.exports = { app, runServer, closeServer };
