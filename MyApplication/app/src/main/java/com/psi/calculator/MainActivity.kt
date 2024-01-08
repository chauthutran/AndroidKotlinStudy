package com.psi.calculator

import android.R
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity



class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

//        mButton = findViewById(R.id.);
//        mButton.setOnClickListener(this);
    }

    fun onClick(view: View) {
        when (view.id) {
            R.id.button_send -> {}
        }
    }
}