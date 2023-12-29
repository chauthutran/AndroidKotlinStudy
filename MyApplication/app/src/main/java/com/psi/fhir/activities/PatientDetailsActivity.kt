package com.psi.fhir.activities

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.ListView
import android.widget.TextView
import com.psi.fhir.R
import com.psi.fhir.data.Patient

class PatientDetailsActivity : AppCompatActivity() {

    private var txtName: TextView? = null
    private var txtHometown: TextView? = null
    private var btnBack: Button? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.patient_details)

        txtName = findViewById <TextView>(R.id.name)
        txtHometown = findViewById <TextView>(R.id.hometown)
        btnBack = findViewById <Button>(R.id.backBtn)

        var patient: Patient = intent.getSerializableExtra("patient") as Patient
        loadPatient(patient);

        //handle button click
        // Use safe-call "btnBack?". In cases the btnBack is null, then don't set "setOnClickListener"
        btnBack?.setOnClickListener {
            //start activity intent
            startActivity(Intent(this@PatientDetailsActivity, PatientListActivity::class.java))
        }
    }

    private fun loadPatient(patient: Patient) {
        // txtName!!.text  --> Allow null value just in case
        txtName!!.text = patient.name
        txtHometown!!.text = patient.hometown
    }
}