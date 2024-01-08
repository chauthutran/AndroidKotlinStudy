package com.psi.fhir.patient.edit

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.liveData
import androidx.lifecycle.viewModelScope
import ca.uhn.fhir.context.FhirContext
import ca.uhn.fhir.context.FhirVersionEnum
import com.google.android.fhir.FhirEngine
import com.google.android.fhir.datacapture.mapping.ResourceMapper
import com.google.android.fhir.get
import com.psi.fhir.FhirApplication
import kotlinx.coroutines.launch
import org.hl7.fhir.r4.model.Patient
import org.hl7.fhir.r4.model.Questionnaire
import org.hl7.fhir.r4.model.QuestionnaireResponse

class EditPatientViewModel( application: Application, private val state: SavedStateHandle) : AndroidViewModel(application){
    private val fhirEngine: FhirEngine = FhirApplication.fhirEngine(application.applicationContext)

    private val patientId: String = requireNotNull(state["patient_id"])
    val livePatientData = liveData { emit(pepareEditPatient()) }

    private suspend fun pepareEditPatient(): Pair<String,String> {
        val patient: Patient = fhirEngine.get(patientId)
//        val launchContexts = mapOf<String, Resource>("client" to patient)

        val question: String = readFileFromAssests("new-patient-registration-paginated.json").trimIndent()
        var parser = FhirContext.forCached(FhirVersionEnum.R4).newJsonParser()
        var questionnaire = parser.parseResource(Questionnaire::class.java, question) as Questionnaire

        var questionnaireResponse: QuestionnaireResponse = ResourceMapper.populate(questionnaire, patient)
        var questionnaireResponseJson = parser.encodeResourceToString(questionnaireResponse)

        return question to questionnaireResponseJson
    }

    private val questionnaire: String
        get()
        {
            questionnaireJson?.let {
                return it
            }

            questionnaireJson = readFileFromAssests(state[EditPatientFragment.QUESTIONNAIRE_FILE_PATH_KEY]!!)
//            return if (questionnaireJson != null) questionnaireJson else throw NullPointerException("Expression 'questionnaireJson' must not be null")
            return questionnaireJson!!
        }

    val isPatientSaved = MutableLiveData<Boolean>()

    private val questionnaireResource: Questionnaire
        get() {
           return FhirContext.forCached(FhirVersionEnum.R4).newJsonParser().parseResource(questionnaire) as Questionnaire
        }

    private var questionnaireJson: String? = null

    /**
     * Update patient registration questionnaire response into the application database.
     *
     * @param questionnaireResponse patient registration questionnaire response
     */
    fun updatePatient(questionnaireResponse: QuestionnaireResponse) {
        viewModelScope.launch {
            val entry = ResourceMapper.extract(questionnaireResource, questionnaireResponse).entryFirstRep
            if (entry.resource !is Patient) return@launch
            val patient = entry.resource as Patient
            if (
                patient.hasName() &&
                patient.name[0].hasGiven() &&
                patient.name[0].hasFamily() &&
                patient.hasBirthDate() &&
                patient.hasTelecom() &&
                patient.telecom[0].value != null
            ) {
                patient.id = patientId
                fhirEngine.update(patient)
                isPatientSaved.value = true
                return@launch
            }

            isPatientSaved.value = false
        }
    }

    private fun readFileFromAssests(fileName: String): String {
        return getApplication<Application>().assets.open(fileName).bufferedReader().use {
            it.readText()
        }
    }

}