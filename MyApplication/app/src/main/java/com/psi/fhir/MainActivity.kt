package com.psi.fhir

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.ListView
import com.psi.fhir.adapters.PatientListAdapter

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
//        lateinit var listView : ListView
//        val titleArray = arrayOf("Pakistan","India","Afghanistan","Bangladesh","China","SriLanka")

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

//        listView = findViewById(R.id.listView)
//        val listAdapter = PatientListAdapter(this, titleArray)
//        listView.adapter = listAdapter
    }
}