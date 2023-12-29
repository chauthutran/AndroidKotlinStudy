package com.psi.fhir.adapters

import android.app.Activity
import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.BaseAdapter
import android.widget.ListView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView.ViewHolder
import com.psi.fhir.R
import com.psi.fhir.data.Patient

class PatientListAdapter (context: Context, patients : ArrayList<Patient>)
    : BaseAdapter(){

    //Passing Values to Local Variables
    private var context = context
    private var patients = patients

    private class ViewHolder() {
        var tvName: TextView? = null
        var tvHometown: TextView? = null
    }

    override fun getCount(): Int {
        //Return Size Of ArrayList
        return patients.size
    }

    override fun getItem(position: Int): Patient {
        return patients.get(position)
    }

    override fun getItemId(position: Int): Long {
        return 0
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {

        var myView = convertView
        val holder: ViewHolder
        if( convertView == null )
        {
            //If Over View is Null than we Inflater view using Layout Inflater
            val mInflater = (context as Activity).layoutInflater
            //Inflating our list_row.
            myView = mInflater.inflate(R.layout.patient_item, parent, false)
            //Create Object of ViewHolder Class and set our View to it
            holder = ViewHolder()
            //Find view By Id For all our Widget taken in list_row.

            /*Here !! are use for non-null asserted two prevent From null.
             you can also use Only Safe (?.)

            */

            holder.tvName = myView!!.findViewById(R.id.tvName)
            holder.tvHometown = myView.findViewById(R.id.tvHometown)

            //Set A Tag to Identify our view
            myView.setTag(holder)
        }
        else
        {
            //If Ouer View in not Null than Just get View using Tag and pass to holder Object.
            holder = myView!!.getTag() as ViewHolder
        }

        //Getting our data at position of List
        val patient = getItem(position)

        //Set Name to our TextView
        holder.tvName!!.text = patient.name

        //Set Id to our TextView
        holder.tvHometown!!.text = patient.hometown


        return myView


////        val inflater = activity.layoutInflater
////        val view = inflater.inflate(R.layout.custom_list_item_layout,null,false)
////        val title = view.findViewById<TextView>(R.id.titleTv)
////        title.text = arrayTitle[position]
////
////        return view
//
//          val patient = getItem(position)
////        var viewHolder: ViewHolder
//
////        var view: View ? = null
////        if( convertView == null )
////        {
//        var viewHolder = ViewHolder()
//
//            val inflater = activity.layoutInflater
//            var view = inflater.inflate(R.layout.patient_item,null,false)
//
//
//            viewHolder.tvName = view.findViewById<TextView>(R.id.tvName)
//            viewHolder.tvHometown = view.findViewById<TextView>(R.id.tvHometown)
//            view.tag = viewHolder
//
////            viewHolder.tvName.text = patient.name
////            viewHolder.tvHometown.text = patient.hometown
//
//            return view
////        }
////        else
////        {
////            var viewHolder = convertView.tag
////            viewHolder.tvName = view.findViewById<TextView>(R.id.tvName)
////            viewHolder.tvHometown = view.findViewById<TextView>(R.id.tvHometown)
////
////            // Return the completed view to render on screen
////            return convertView
////        }


    }


}
