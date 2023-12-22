/* eslint-disable max-len */
/* eslint-disable prefer-const */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-trailing-spaces */
/* eslint-disable keyword-spacing */
/* eslint-disable comma-dangle */
/* eslint-disable padded-blocks */
/* eslint-disable indent */
/* eslint-disable spaced-comment */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable no-undef */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const cors = require("cors");
const { response } = require("express");
const app = express();
app.use(cors({ origin: true }));
const db = admin.firestore();


// Routes
app.get("/", (req, res) => {
  return res.status(200).send("Test routes berhasil!");
});

// tambah data tanaman => post
app.post("/addplant", (req, res) => {
  (async () => {
    try {
      await db.collection("plants").doc(`/${Date.now()}/`).create({
        id: Date.now(),
        plantFamily: req.body.plantFamily,
        description: req.body.description,
        wateringFrequence: req.body.wateringFrequence,
        waterLevel: req.body.waterLevel,
        attachment: req.body.attachment,
      });

      return res.status(200).send({ status: "Success", msg: "Data Saved" });
      
    } catch (error) {

      console.log(error);
      res.status(500).send({ status: "Failed", msg: error });

    }
  })();
});

// cari spesifik tanaman berdasarkan id => get
app.get("/plantDetail/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("plants").doc(req.params.id);
        let plants = await reqDoc.get();
        let response = plants.data();
  
        return res.status(200).send({ status: "Success", data: response });

      } catch (error) {

        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });

      }
    })();
  });

  // Cari tanaman berdasarkan plantSpecies => get
app.get("/plantBySpecies/:plantFamily", async (req, res) => {
    try {
      const querySnapshot = await db.collection("plants").where("plantFamily", "==", req.params.plantFamily).get();
      const plants = [];
      
      querySnapshot.forEach((doc) => {
        plants.push(doc.data());
      });
  
      if (plants.length > 0) {
        return res.status(200).send({ status: "Success", data: plants });
      } else {
        return res.status(404).send({ status: "Not Found", msg: "Data not found for plantSpecies: " + plantSpecies });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({ status: "Failed", msg: error });
    }
  });
  
  // ambil semua tanaman => get
  app.get("/allPlantDetail", (req, res) => {
    (async () => {
      try {
        let query = db.collection("plants");
        let response = [];
  
        await query.get().then((data) => {
          let docs = data.docs; // query results
  
          docs.map((doc) => {
            const selectedData = {
                plantFamily: doc.data().plantFamily,
                description: doc.data().description,
                wateringFrequence: doc.data().wateringFrequence,
                waterLevel: doc.data().waterLevel,
                attachment: doc.data().attachment,
            };
  
            response.push(selectedData);
          });
          return response;
        });
  
        return res.status(200).send({ status: "Success", data: response });

      } catch (error) {

        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });

      }
    })();
  });
  
  // ubah data tanaman => put
  app.put("/updatePlant/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("plants").doc(req.params.id);
        await reqDoc.update({
            plantFamily: req.body.plantFamily,
            description: req.body.description,
            wateringFrequence: req.body.wateringFrequence,
            waterLevel: req.body.waterLevel,
            attachment: req.body.attachment,
        });

        return res.status(200).send({ status: "Success", msg: "Data Updated" });

      } catch (error) {

        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });

      }
    })();
  });
  
  // Hapus tanaman => delete
  app.delete("/deletePlant/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("plants").doc(req.params.id);
        await reqDoc.delete();

        return res.status(200).send({ status: "Success", msg: "Data Removed" });

      } catch (error) {

        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });

      }
    })();
  });


exports.app = functions.https.onRequest(app);
