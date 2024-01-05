package com.psi.fhir

import android.app.Application
import android.content.Context
import android.util.Log
import com.google.android.fhir.DatabaseErrorStrategy
import com.google.android.fhir.FhirEngine
import com.google.android.fhir.FhirEngineConfiguration
import com.google.android.fhir.FhirEngineProvider
import com.google.android.fhir.NetworkConfiguration
import com.google.android.fhir.ServerConfiguration
import com.google.android.fhir.sync.remote.HttpLogger

class FhirApplication : Application() {

    // Only initiate the FhirEngine when used for the first time, not when the app is created.
    private val fhirEngine: FhirEngine by lazy { constructFhirEngine() }

    override fun onCreate()
    {
        super.onCreate()

        // Init the Fhir Engine
        FhirEngineProvider.init(
            FhirEngineConfiguration(
                //Enables data encryption if the device supports it.
                enableEncryptionIfSupported = true,
                // Determines the database error strategy. In this case, it recreates the database if an error occurs upon opening
                DatabaseErrorStrategy.RECREATE_AT_OPEN,
                ServerConfiguration(
                    "https://hapi.fhir.org/baseR4/",
                    httpLogger =
                    HttpLogger(
                        HttpLogger.Configuration(
                            if (BuildConfig.DEBUG) HttpLogger.Level.BODY else HttpLogger.Level.BASIC,
                        ),
                    ) {
                        Log.d("App-HttpLog", it)
                    },
                    networkConfiguration = NetworkConfiguration(uploadWithGzip = false),
                ),
            ),
        )

    }

    // This instantiate of FHIR Engine ensures the FhirEngine instance is only created when it's accessed for the first time, not immediately when the app starts.
    private fun constructFhirEngine(): FhirEngine {
        return FhirEngineProvider.getInstance(this)
    }

    // Easier access throughout your application
    companion object {
        fun fhirEngine(context: Context) = (context.applicationContext as FhirApplication).fhirEngine
    }

//    companion object {
//        fun fhirEngine(context: Context) = (context.applicationContext as FhirApplication).fhirEngine
//        fun fhirContext(context: Context) = (context.applicationContext as FhirApplication).fhirContext
//        fun fhirOperator(context: Context) = (context.applicationContext as FhirApplication).fhirOperator
//    }
}