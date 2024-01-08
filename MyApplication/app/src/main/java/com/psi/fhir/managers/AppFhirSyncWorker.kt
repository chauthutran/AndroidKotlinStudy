package com.psi.fhir.managers

import android.content.Context
import androidx.work.WorkerParameters
import com.google.android.fhir.sync.AcceptLocalConflictResolver
import com.google.android.fhir.sync.FhirSyncWorker
import com.psi.fhir.FhirApplication
import com.psi.fhir.patient.DownloadWorkManagerImpl

/**
 * This class defines how the app will sync with the remote FHIR server using a background worker.
 * **/
class AppFhirSyncWorker(private val appContext: Context, workerParams: WorkerParameters): FhirSyncWorker(appContext, workerParams) {


    override fun getDownloadWorkManager() = DownloadWorkManagerImpl()

    override fun getConflictResolver() = AcceptLocalConflictResolver

    override fun getFhirEngine() = FhirApplication.fhirEngine(applicationContext)

}