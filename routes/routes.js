const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const Multer = require('multer')
const imgUpload = require('../modules/imgUpload')

const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
})

const connection = mysql.createConnection({
    host: '34.101.166.52',
    user: 'root',
    database: 'floraguardian',
    password: '123456'
})

// ---Ambil semua data plant---
router.get("/plant", (req, res) => {
    const query = "SELECT * FROM plant"
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

// Ambil 10 tanaman, terakhir yang ditambahkan
router.get("/plant", (req, res) => {
    const query = "SELECT * FROM plant ORDER BY id DESC LIMIT 10"
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

// ---Ambil tanaman berdasarkan id---
router.get("/plant/:id", (req, res) => {
    const id = req.params.id

    const query = "SELECT * FROM plant WHERE id = ?"
    connection.query(query, [id], (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

// Fungsi belum beres
// router.get("/plant", (req, res) => {
//     const s = req.query.s;

//     console.log(s)
//     const query = "SELECT * FROM plant WHERE name LIKE '%" + s + "%' or scientificName LIKE '%" + s + "%'"
//     connection.query(query, (err, rows, field) => {
//         if(err) {
//             res.status(500).send({message: err.sqlMessage})
//         } else {
//             res.json(rows)
//         }
//     })
// })

// ---Masukan data tanaman---
router.post("/plant", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
    const name = req.body.name
    const scientificName = req.body.scientificName
    const description = req.body.description
    const wateringTime = req.body.wateringTime
    var imageUrl = ''

    if (req.file && req.file.cloudStoragePublicUrl) {
        imageUrl = req.file.cloudStoragePublicUrl
    }

    const query = "INSERT INTO plant (name, scientificName, description, wateringTime, attachment) values (?, ?, ?, ?, ?)"

    connection.query(query, [name, scientificName, description, wateringTime, imageUrl], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Insert Successful"})
        }
    })
})

// ---Ubah data tanaman---
router.put("/plant/:id", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
    const id = req.params.id
    const name = req.body.name
    const scientificName = req.body.scientificName
    const description = req.body.description
    const wateringTime = req.body.wateringTime
    var imageUrl = ''

    if (req.file && req.file.cloudStoragePublicUrl) {
        imageUrl = req.file.cloudStoragePublicUrl
    }

    const query = "UPDATE plant SET name = ?, scientificName = ?, description = ?, wateringTime = ?, attachment = ? WHERE id = ?"
    
    connection.query(query, [name, scientificName, description, wateringTime, imageUrl, id], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Update Successful"})
        }
    })
})

// ---Hapus data tanaman---
router.delete("/plant/:id", (req, res) => {
    const id = req.params.id
    
    const query = "DELETE FROM plant WHERE id = ?"
    connection.query(query, [id], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Delete successful"})
        }
    })
})

// ---Upload image---
router.post("/uploadImage", multer.single('image'), imgUpload.uploadToGcs, (req, res, next) => {
    const data = req.body
    if (req.file && req.file.cloudStoragePublicUrl) {
        data.imageUrl = req.file.cloudStoragePublicUrl
    }

    res.send(data)
})

module.exports = router
