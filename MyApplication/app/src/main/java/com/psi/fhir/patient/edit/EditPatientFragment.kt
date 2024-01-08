package com.psi.fhir.patient.edit

import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.commit
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.NavHostFragment
import com.google.android.fhir.datacapture.QuestionnaireFragment
import com.psi.fhir.MainActivity
import com.psi.fhir.R

class EditPatientFragment : Fragment(R.layout.add_patient_fragment) {
    private val viewModel: EditPatientViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setHasOptionsMenu(true)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
       super.onViewCreated(view, savedInstanceState)
        (requireActivity() as AppCompatActivity).supportActionBar?.apply {
            title = R.string.edit_patient.toString()
        }
        requireArguments().putString(QUESTIONNAIRE_FILE_PATH_KEY, "new-patient-registration-paginated.json")
        viewModel.livePatientData.observe(viewLifecycleOwner) { addQuestionnaireFragment(it) }
        viewModel.isPatientSaved.observe(viewLifecycleOwner) {
            if (!it) {
                Toast.makeText(requireContext(), R.string.inputs_missing, Toast.LENGTH_SHORT).show()
                return@observe
            }
            Toast.makeText(requireContext(), R.string.message_patient_updated, Toast.LENGTH_SHORT)
                .show()
            NavHostFragment.findNavController(this).navigateUp()
        }
        (activity as MainActivity).setDrawerEnabled(false)

        /** Use the provided cancel|submit buttons from the sdc library */
        childFragmentManager.setFragmentResultListener(
            QuestionnaireFragment.SUBMIT_REQUEST_KEY,
            viewLifecycleOwner,
        ) { _, _ ->
            onSubmitAction()
        }
        childFragmentManager.setFragmentResultListener(
            "QuestionnaireFragment.CANCEL_REQUEST_KEY",
            viewLifecycleOwner,
        ) { _, _ ->
            NavHostFragment.findNavController(this@EditPatientFragment).navigateUp()
        }
    }


    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                NavHostFragment.findNavController(this@EditPatientFragment).navigateUp()
                true
            }
            else -> false
        }
    }

    private fun addQuestionnaireFragment(pair: Pair<String, String>) {
        childFragmentManager.commit {
            add(
                R.id.add_patient_container,
                QuestionnaireFragment.builder()
                    .setQuestionnaire(pair.first)
                    .setQuestionnaireResponse(pair.second)
                    .build(),
                QUESTIONNAIRE_FRAGMENT_TAG,
            )
        }
    }

    private fun onSubmitAction() {
        val questionnaireFragment =
            childFragmentManager.findFragmentByTag(QUESTIONNAIRE_FRAGMENT_TAG) as QuestionnaireFragment
        viewModel.updatePatient(questionnaireFragment.getQuestionnaireResponse())
    }

    companion object {
        const val QUESTIONNAIRE_FILE_PATH_KEY: String = "edit-questionnaire-file-path-key"
        const val QUESTIONNAIRE_FRAGMENT_TAG = "edit-questionnaire-fragment-tag"
    }
}