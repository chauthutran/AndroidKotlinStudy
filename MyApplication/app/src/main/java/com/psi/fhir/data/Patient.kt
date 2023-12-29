package com.psi.fhir.data

import java.io.Serializable

data class Patient(var name: String, var hometown: String) : Serializable

//{
//
//    init {
//        this.name = name
//        this.hometown = hometown
//    }
//}
