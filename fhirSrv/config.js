const dotenv = require('dotenv')

dotenv.config();

module.exports = {
    _PORT: process.env.PORT,

    _FHIR_HOST: process.env.FHIR_HOST,
    _FHIR_USR: process.env.FHIR_USR,
    _FHIR_PWD: process.env.FHIR_PWD,
    _FHIR_PROJECT: process.env.FHIR_PROJECT,

    _PRACTITIONER_LIST: process.env.PRACTITIONER_LIST
}