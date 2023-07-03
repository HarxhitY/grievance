const express = require('express')
const { Complaint} = require('../models/complaint')

const router = express.Router()
const { checkNotAuthenticated } = require('../middleware/auth')
const ComplaintController = require('../controllers/ComplaintController')

// Add new complaint by users
router.post(
  '/complaints/add',
  checkNotAuthenticated,
  ComplaintController.addComplaint
)

router.post(
  '/complaints/all',(req,res) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    Complaint.find({citizenship: req.query.citizenship}).then((allData)=>{
        res.json(allData)
    }).catch((e)=>{
      res.send("ERROR 404 NOT FOUND")
    })
  }
)

module.exports = router
