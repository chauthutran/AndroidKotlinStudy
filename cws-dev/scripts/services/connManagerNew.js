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


function ConnManager() {};

ConnManager._cwsRenderObj;


ConnManager.initialize = function() 
{
	ConnManager.initialiseNetworkSererMonitors()
};

ConnManager.createConnectionMonitors = function()
{
	ConnManager.monitorNetworkStatusChanges();

	ConnManager.monitorDataServerAvailable();

};

ConnManager.monitorNetworkStatusChanges = function()
{
	// track online/offline changes


};

ConnManager.monitorDataServerAvailable = function()
{
	// create  Server Available changes

}