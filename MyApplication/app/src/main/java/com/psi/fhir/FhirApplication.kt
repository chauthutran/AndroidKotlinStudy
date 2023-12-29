package com.psi.fhir

import android.app.Application
import android.util.Log
import com.google.android.fhir.FhirEngineConfiguration
import com.google.android.fhir.FhirEngineProvider
import com.google.android.fhir.ServerConfiguration
import com.google.android.fhir.sync.remote.HttpLogger
import com.google.android.fhir.DatabaseErrorStrategy.RECREATE_AT_OPEN

class FhirApplication : Application() {

    override fun onCreate()
    {
        super.onCreate()

        // Init the Fhir Engine
        FhirEngineProvider.init(
            FhirEngineConfiguration(
                enableEncryptionIfSupported = true,
                RECREATE_AT_OPEN,
                ServerConfiguration(
                    baseUrl = "http://localhost:8080/fhir/",
                    httpLogger = HttpLogger(
                        HttpLogger.Configuration(
                            if (BuildConfig.DEBUG) HttpLogger.Level.BODY else HttpLogger.Level.BASIC,
                        ),
                    ) {
                        Log.d("App-HttpLog", it)
                    },
                ),
            ),
        )

    }
}