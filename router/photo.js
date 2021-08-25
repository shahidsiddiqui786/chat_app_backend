const express = require('express'),
    router = express.Router(),
    Employee = require('./models/Employee');

    app.get('/',(req,res) => {
        res.send("hi I am running well")
     })
     
     // post photo route
     app.post('/send-data',(req,res)=>{
         const employee = new Employee({
             name:req.body.name,
             room:req.body.room,
             picture:req.body.picture,  
         })
         employee.save()
         .then(data=>{
             console.log(data)
             res.send(data)
         }).catch(err=>{
             console.log(err)
         })  
     })
     
     // delete photo route
     app.post('/delete',(req,res)=>{
         Employee.findByIdAndRemove(req.body.id)
         .then(data=>{
             console.log(data)
             res.send("deleted")
         })
         .catch(err=>{ 
             console.log(err)
         })
     })
     


    module.exports = router;