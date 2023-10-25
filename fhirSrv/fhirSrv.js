const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const {ActivityController}  = require("./utils/ActivityController");
const activityController = new ActivityController();



/* -------------------------------------------------------------------------- */

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    console.info("GET /");
    res.json({
        text: "The FHIR server is started."
    });
});

/* -------------------------------------------------------------------------- */

app.get("/export", cors(), (req, res) => {
    console.info("GET /");
    
    var type = req.query.type;
    if( type == undefined ) type = "json";

    activityController.loadActivities(type, function(responseData) {
        if( type == "csv")
        {
            // res.set('Content-Type', 'application/octet-stream');
            // res.send(<your data>);
            var curDate = (new Date()).toISOString();
            var fileName = `export_${curDate}.csv`;
            res.set('Content-disposition', 'attachment; filename=' + fileName );
            res.send(Buffer.from(responseData.data));
        }
        else {
            res.json(responseData);
        }
    });
});

// app.get("/prcs", cors(), (req, res) => {
//     console.info("GET /");
//     activityController.getPractitionersByIds(function(responseData){
//         res.json(responseData);
//     });
// });

// =====================================================================================================
// app.post("/upload", cors(), (req, res) => {
//     const url = FHIR_SERVER_BASE_URL + "appointment";
//     requestUtils.sendPostRequest(url, req.body, function (response) {
//         res.json(response);
//     });
// });



// =====================================================================================================
/* ===================================================================================================== */

if (!module.parent) {
    const port = process.env.PORT || 3120;

    app.listen(port, () => {
        console.log("Express server listening on port " + port + ".");
    });
}