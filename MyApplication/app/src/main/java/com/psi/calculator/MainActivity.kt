package com.psi.calculator

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import android.R

class MainActivity : AppCompatActivity() {
    private var txtValue: TextView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_list_item activity_main)

        txtValue = findViewById(R.id.txtValue)
    }

    fun onClickHandler(view: View) {
        var formular: String = txtValue?.text.toString()
        var btnObj: Button = this.findViewById<Button>(view.id)
        var clickedValue = btnObj.text
        if ( btnObj.id !=  R.id.btnEquals ) {
            if( view.id != R.id.btnDecimal && view.id != R.id.btnSign ) {
                txtValue!!.text = formular + " " + clickedValue
            }
            else
            {
                txtValue!!.text = formular + clickedValue
            }
        }
    }
}