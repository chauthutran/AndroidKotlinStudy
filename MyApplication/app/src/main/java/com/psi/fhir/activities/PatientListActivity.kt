package com.psi.fhir.activities

import android.content.Intent
import android.os.Bundle
import android.widget.AdapterView.OnItemClickListener
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.psi.fhir.R
import com.psi.fhir.adapters.PatientListAdapter
import com.psi.fhir.data.Patient

class PatientListActivity: AppCompatActivity() {
    private val txtName: TextView? = null
    private val txtHometown: TextView? = null
//    private var adapter: PatientListAdapter? = null;

    lateinit var listView : ListView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.patient_list)

        // Create the adapter to convert the array to views
        // Create the adapter to convert the array to views
        var patientList = ArrayList<Patient>()
        patientList.add(Patient("Harry", "San Diego"))
        patientList.add(Patient("Marla", "San Francisco"))
        patientList.add(Patient("Sarah", "San Marco"))


        var patientListAdapter = PatientListAdapter(this, patientList)

        // Attach the adapter to a ListView
        listView = findViewById <ListView>(R.id.lvPatient)
        listView.adapter = patientListAdapter

        //On Click for ListView Item
        setupPatientSelectedListener(patientListAdapter)

    }

    fun setupPatientSelectedListener( patientListAdapter: PatientListAdapter) {

        listView.onItemClickListener =
            OnItemClickListener { parent, view, position, id ->

                // Launch the detail view passing patient as an extra
                val intent = Intent(this@PatientListActivity, PatientDetailsActivity::class.java )
                intent.putExtra("patient", patientListAdapter.getItem(position))
                startActivity(intent)
            }
    }
}