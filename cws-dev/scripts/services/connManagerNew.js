// -------------------------------------------
// -- ConnManager Class/Methods

// ConnManager() - network status info & server connection status info store..  for quick access of this info.
// 		Other Task Run or Not Check - Fetch doable..  Others. ?

// Maybe new class:
// BackgroundTask();
// Scheduling For Interval Checks - 
//			- What kind of things do we do on these interval ones...
//				- Online/Offline (of network)
//				- Data Server availabilty Check
//				- 3G/2G switch check?

// ------------------------  [Ideally]
//  Run();
//		--> CheckNetworkStatus(Online/Offline)()
//		--> CheckDataServerAvailabiility()		(DataServerAvailability.-------)
//		--> NetworkSpeedType (3G/2G) Check()    (NetworkType.------)
//				--> StoreData()
// -------------------------

// Maybe new class:
// NetworkType();  <-- Has all the methods related to 3G/2G etc..


function ConnManagerNew() {};

ConnManagerNew._cwsRenderObj;

// ScheduleManager will do this one instead..
/*ConnManagerNew.initialize = function() 
{
	ConnManagerNew.initialiseNetworkSererMonitors()
};

ConnManagerNew.createConnectionMonitors = function()
{
	ConnMaConnManagerNewnager.monitorNetworkStatusChanges();

	ConnManagerNew.monitorDataServerAvailable();

};

ConnManagerNew.monitorNetworkStatusChanges = function()
{
	// track online/offline changes


};

ConnManagerNew.monitorDataServerAvailable = function()
{
	// create  Server Available changes

}*/

// Calling it on method from 'statusInfoManager.js' instead.
/*
// TODO: MOVE: Create statusInfoSummary class to get all status data at once?
ConnManagerNew.getCurrentStatusSummary = function()
{
	// TODO: Need to change 'ConnManager' to ..?.
	var connSummary = {
		'networkOnline': ConnManager.network_Online,
		'dataServerOnline': ConnManager.dataServer_Online,
		'serverStateChanged': ConnManager.serverStateChanged,
		'promptSwitchNetworkMode': ConnManager.network_Online,
		'promptSwitchUserNetworkMode': ConnManager.promptSwitchUserNetworkMode		
	};

	// create  Server Available changes
	return connSummary;
}
*/